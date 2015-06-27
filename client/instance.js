var bestAudioFileType = require('./best-audio-node.js')
var webtorrentConfig = require('../config.json').webtorrent
var defaultFileValidator = require('./file-validity.js').valid
var each = require('async-each')

module.exports = function instance(torrenter, emitter, customFileValidator) {
	var fileValidator = customFileValidator || defaultFileValidator
	var storage = {}
	var preferredFileType = bestAudioFileType()

	function saveSong(id) {
		return function ontorrent(torrent) {
			var file = torrent.files[0]
			if (process.browser) {
				file.getBlobURL(function (err, url) {
					storage[id] = url
				})
			} else {
				storage[id] = file
			}
		}
	}

	function download(songBundles) {
		// console.log('DONWLODN:', songBundles)
		ensureArray(songBundles).forEach(function dl(songBundle) {
			// console.log('song bundle:', songBundle)
			var infoHash = songBundle[preferredFileType]
			var id = songBundle
			torrenter.add(infoHash, webtorrentConfig, saveSong(id))
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
		// console.log('UPLAOD', files)
		var validFiles = ensureArray(files).filter(fileValidator)
		each(validFiles, uploadFile, cb)
	}

	return upload
}

	/*
	function get(songId) {
		return storage[songId]
	}

	function remove(songId) {
		torrenter.remove(storage) // What?
		return (delete storage[songId])
	}

	return {
		download: download,
		upload: upload,
		get: get,
		remove: remove
	}
	*/

function ensureArray(thing) {
	return (Array.isArray(thing)) ? thing : [thing]
}
