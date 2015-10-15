var defaultFileValidator = require('./file-validity.js').valid
var each = require('async-each')

module.exports = function instance(torrenter, emitter, customFileValidator) {
	var fileValidator = customFileValidator || defaultFileValidator
	var storage = {}

	function download(infoHashes) {
		ensureArray(infoHashes).forEach(function dl(infoHash) {
			torrenter.add(infoHash, { announce: [ 'wss://tracker.webtorrent.io' ] }, function ontorrent(torrent) {
				var file = torrent.files[0]
				if (process.browser) {
					file.getBlobURL(function (err, url) {
						storage[infoHash] = url
					})
				} else {
					storage[infoHash] = file
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

	function remove(infoHash) {
		torrenter.remove(infoHash)
		delete storage[infoHash]
	}

	function get(infoHash) {
		return storage[infoHash]
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
