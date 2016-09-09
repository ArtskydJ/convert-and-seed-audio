var defaultFileValidator = require('./file-validity.js').valid
var each = require('async-each')
var Upload = require('./node-upload.js') // 'upload-component-browserify' in the browser

module.exports = function instance(torrenter, emitter, customFileValidator) {
	// why does it get an emitter???
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

	function upload(files, cb) {
		var validFiles = ensureArray(files).filter(fileValidator)

		each(validFiles, function uploadFile(file, next) {
			new Upload(file).to('/upload', function (err, res) {
				if (!err) file = res
				torrenter.seed(file)
			})
		}, cb)
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
	return (Array.isArray(thing)) ? thing : [ thing ]
}
