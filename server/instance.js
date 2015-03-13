var EventEmitter = require('events').EventEmitter
var sox = require('sox-stream')
var xtend = require('xtend')
var path = require('path')
var each = require('async-each')
var createTempFile = require('create-temp-file')
var cfg = require('../config.json')

module.exports = function Instance(torrenter, test) {
	var emitter = new EventEmitter()

	if (test) {
		emitter.on('test_shut_down', function () {
			console.log('server shutting down!')
			torrenter.destroy()
		})
	}

	var upcomingSongs = [] //playing and upcoming

	emitter.on('upload', function (infHsh) {
		console.log('upload ' + infHsh)
		torrenter.download(infHsh, cfg.webtorrent, onTorrent(function finished(err, hashes) {
			console.log('upload done', err, hashes)
			err ?
				console.error('upload error: ' + err.message) :
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
			var stream = file.createReadStream()
			each(cfg.extensions, uploadFormat(file.name, stream), cb)
		} else {
			cb(new Error('No file found in torrent: ' + torrent && torrent.infoHash))
		}
	}
}

function uploadFormat(filename, stream) {
	return function uf(extension, next) {
		console.log('Converting ' + filename + ' to a ' + extension + ' file.')
		var tmpFile = createTempFile()
		var doConvert = isExtension(filename, extension)
		if (doConvert) {
			convert(stream, extension)
				.pipe(tmpFile)
				.on('finish', function () {
					var newTorrent = torrenter.seed([tmpFile.path], function () {}) //skip the noop?
					next(null, newTorrent.infoHash)
				})
		} else {
			next(torrent.infoHash)
		}
	}
}

function isExtension(filename, extension) {
	return extension.toLowerCase() === path.extname(filename).toLowerCase()
}

function convert(stream, extension) {
	return stream.pipe( sox({ type: extension }) )
}
