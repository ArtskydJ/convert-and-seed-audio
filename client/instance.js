var bestAudioFileType = require('./best-audio-node.js')
var webtorrentConfig = require('../config.json').webtorrent
var defaultValidFile = require('./file-validity.js').valid

module.exports = function instance(torrenter, emitter, customValidFile) {
	var transfer = fileTransfer(torrenter, customValidFile || defaultValidFile)

	emitter.on('uploaded-bundle', transfer.download)

	return function upload(files, cb) {
		transfer.upload(files, function (infoHash) {
			emitter.emit('seeding', infoHash)
			cb(infoHash) // this should be all the info hashes, not one at a time; this callback is called multiple times...
		})
	}
}

function fileTransfer(torrenter, validFile) {
	var storage = {}
	var preferredFileType = bestAudioFileType()

	function download(songBundles) {
		console.log('DONWLODN:', songBundles)
		ensureArray(songBundles).forEach(function dl(songBundle) {
			console.log('song bundle:', songBundle)
			var infoHash = songBundle[preferredFileType]
			var id = songBundle
			torrenter.download(infoHash, webtorrentConfig, saveSong(id))
		})
	}

	function upload(files, cb) {
		console.log('UPLAOD', files)
		ensureArray(files).filter(validFile).forEach(function (file) { // use async each here!!!!!
			torrenter.seed(file, function onseed(torrent) {
				cb(torrent.infoHash)
			})
		})
	}

	function get(songId) {
		return storage[songId]
	}

	function remove(songId) {
		torrenter.remove(storage) // What?
		return (delete storage[songId])
	}

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
