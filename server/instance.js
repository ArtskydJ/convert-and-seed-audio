var EventEmitter = require('events').EventEmitter
var Sox = require('sox-stream')
var path = require('path')
var each = require('async-each')
var createTempFile = require('create-temp-file')()
var uuid = require('random-uuid-v4')
var cfg = require('../config.json')
var extensions = cfg.extensions
require('string.prototype.endswith')

module.exports = function Instance(emitter, filesStream) {
	var emitter = new EventEmitter()

	function onFileUploaded(err, bundle) {
		if (err) emitter.emit('error', err)
		else emitter.emit('new-bundle', bundle)
	}

	emitter.on('upload-request', function ul(infHsh) {
		torrenter.download(infHsh, webtorrentConfig, onTorrent(torrenter, onFileUploaded))
	})

	return emitter
}

function onTorrent(torrenter, cb) {
	return function ot(torrent) {
		var file = torrent.files[0]
		if (file) {
			each(extensions, seedConverted(torrenter, file, torrent.infoHash), function (err, hashes) {
				if (err) {
					cb(err)
				} else {
					var bundle = extensions.reduce(function (memo, curr, i) {
						memo[curr] = hashes[i]
						return memo
					}, { id: uuid() })
					cb(null, bundle)
				}
			})
		} else {
			cb(new Error('No file found in torrent: ' + torrent && torrent.infoHash))
		}
	}
}

function seedConverted(torrenter, file, infoHash) {
	return function uf(desiredExtension, next) {
		var doNotConvert = file.name.endsWith(desiredExtension)

		if (doNotConvert) {
			next(null, infoHash)
		} else {
			var convert = Sox({ type: desiredExtension })
			var tmpFile = createTempFile(desiredExtension)
			file.createReadStream()
				.pipe(convert)
				.pipe(tmpFile)
				.on('finish', function finish() {
					torrenter.seed(tmpFile.path, function ontorrent(newTorrent) {
						next(null, newTorrent.infoHash)
					})
				})
		}
	}
}
