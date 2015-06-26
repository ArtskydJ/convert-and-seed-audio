var EventEmitter = require('events').EventEmitter
var Sox = require('sox-stream')
var xtend = require('xtend')
var path = require('path')
var each = require('async-each')
var createTempFile = require('create-temp-file')
var cfg = require('../config.json')
var extensions = cfg.extensions
var webtorrentConfig = cfg.webtorrent
require('string.prototype.endswith')

module.exports = function Instance(torrenter) {
	var emitter = new EventEmitter()

	emitter.on('upload', function ul(infHsh) {
		console.log('upload ' + infHsh)
		torrenter.download(infHsh, webtorrentConfig, onTorrent(function finished(err, hashes) {
			console.log('upload done', err, hashes)
			err ?
				emitter.emit('error', err) :
				emitter.emit('uploaded-hashes', hashes)
		}))
	})

	return emitter


	function onTorrent(cb) {
		return function ot(torrent) {
			console.log('on torrent')
			var file = torrent.files[0]
			if (file) {
				each(extensions, seedConverted(file, torrent.infoHash), function (err, hashes) {
					if (err) {
						cb(err)
					} else {
						cb(null, hashes.map(String))
						/*var bundle = extensions.reduce(function (memo, curr, i) {
							memo[curr] = hashes[i]
							return memo
						}, {})
						cb(null, bundle)*/
					}
				})
			} else {
				cb(new Error('No file found in torrent: ' + torrent && torrent.infoHash))
			}
		}
	}

	function seedConverted(file, infoHash) {
		return function uf(desiredExtension, next) {
			var doNotConvert = file.name.endsWith(desiredExtension)

			if (doNotConvert) {
				console.log(file.name + ' is already a ' + desiredExtension + ' file.')

				next(null, infoHash)
			} else {
				console.log('Converting ' + file.name + ' to a ' + desiredExtension + ' file.')

				var convert = Sox({ type: desiredExtension })
				var tmpFile = createTempFile()

				file.createReadStream()
					.pipe(convert)
					.pipe(tmpFile)
					.on('finish', function f() {
						var newTorrent = torrenter.seed([tmpFile.path], function n() {}) //skip the noop?
						next(null, newTorrent.infoHash)
					})
			}
		}
	}
}
