var EventEmitter = require('events').EventEmitter
var sox = require('sox-stream')
var xtend = require('xtend')
var path = require('path')
var each = require('async-each')
var createTempFile = require('create-temp-file')
var cfg = require('../config.json')

module.exports = function Instance(torrenter) {
	var emitter = new EventEmitter()

	emitter.on('upload', function (infHsh) {
		console.log('upload ' + infHsh)
		torrenter.download(infHsh, cfg.webtorrent, onTorrent(function finished(err, hashes) {
			console.log('upload done', err, hashes)
			err ?
				emitter.emit('error', err) :
				emitter.emit('hashes', hashes)
		}))
	})

	return emitter
}

function onTorrent(cb) {
	return function ot(torrent) {
		console.log('on torrent')
		var file = torrent.files[0]
		if (file) {
			each(cfg.extensions, uploadFormat(file, torrent.infoHash), cb)
		} else {
			cb(new Error('No file found in torrent: ' + torrent && torrent.infoHash))
		}
	}
}

function uploadFormat(file, infoHash) {
	return function uf(extension, next) {
		console.log('Converting ' + file.name + ' to a ' + extension + ' file.')
		var tmpFile = createTempFile()
		var doConvert = isExtension(file.name, extension)
		if (doConvert) {
			var stream = file.createReadStream()
			convert(stream, extension)
				.pipe(tmpFile)
				.on('finish', function () {
					var newTorrent = torrenter.seed([tmpFile.path], function () {}) //skip the noop?
					next(null, newTorrent.infoHash)
				})
		} else {
			next(null, infoHash)
		}
	}
}

function isExtension(filename, extension) {
	return extension.toLowerCase() === path.extname(filename).toLowerCase()
}

function convert(stream, extension) {
	return stream.pipe( sox({ type: extension }) )
}
