var supportedAudio = require('supported-audio')
var config = require('../config.json')
var defaultFileValidator = require('./file-validity.js').valid
var each = require('async-each')

module.exports = function instance(torrenter, emitter, customFileValidator) {
	var fileValidator = customFileValidator || defaultFileValidator
	var storage = {}
	var preferredFileType = supportedAudio(config.extensions) || config.defaultExtension

	function download(songBundles) {
		ensureArray(songBundles).forEach(function dl(songBundle) {
			var infoHash = songBundle[preferredFileType]
			var id = songBundle.id
			torrenter.add(infoHash, webtorrentConfig, function ontorrent(torrent) {
				var file = torrent.files[0]
				if (process.browser) {
					file.getBlobURL(function (err, url) {
						storage[id] = url
					})
				} else {
					storage[id] = file
				}
			})
		})
	}

	emitter.on('new-bundle', download)

	function uploadFile(file, next) {
		torrenter.seed(file, function onseed(torrent) {
			emitter.emit('upload-request', torrent.infoHash)
			next(null, torrent.infoHash)
		})
	}

	function upload(files, cb) {
		var validFiles = ensureArray(files).filter(fileValidator)
		each(validFiles, uploadFile, cb)
	}

	function remove(songId) {
		torrenter.remove(songId)
		delete storage[songId]
	}

	function get(songId) {
		return storage[songId]
	}

	return {
		download: download,
		upload: upload,
		get: get,
		remove: remove
	}
}

function ensureArray(thing) {
	return (Array.isArray(thing)) ? thing : [thing]
}
