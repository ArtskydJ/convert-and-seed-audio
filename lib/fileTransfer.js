var StreamToBlob = require('blob-stream')
var Webtorrent = require('webtorrent')
var domready = require('domready')
var supportedAudio = require('./supportedAudio.js')
var validFile = require('./fileValidity.js').valid
var cfg = require('./config.json')

var torrenter = new Webtorrent()

module.exports = function () {
	var storage = {}
	var preferredFileType = cfg.defaultFileType
	supportedAudio(function (type) {
		preferredFileType = type
	})

	function download(songBundles) {
		if (!Array.isArray(songBundles)) {
			songBundles = [songBundles]
		}
		songBundles.forEach(function dl() {
			var infoHash = songBundle[preferredFileType]
			var id = songBundle.id
			torrenter.download({
				infoHash: infoHash,
				announce: cfg.announce
			}, saveSong(id))
		})
	}

	function upload(files, cb) {
		files.filter(validFile).forEach(function (file) {
			var meta = copyProperties(file, ['name', 'size', 'type'])
			torrenter.seed(file, function onseed(torrent) {
				cb(torrent.infoHash) //tell the server that a file is available!
			})
		})
	}

	function get(songId) {
		return storage[songId]
	}

	function remove(songId) {
		torrenter.remove(storage)
		storage[songId].stop()
		return (delete storage[songId])
	}

	return {
		download: download,
		upload: upload,
		get: get,
		remove: remove
	}
}

function saveSong(id) {
	//logGetting(id)
	return function ontorrent(torrent) {
		//logDownloaded(torrent)
		var file = torrent.files[0]
		file.createReadStream()
			.pipe(StreamToBlob())
			.on('finish', function () {
				storage[id] = this.toBlobURL()
			})
	}
}

/*
function logDownloaded(torrent) {
	console.log('window.play("' + torrent.infoHash + '")')
	console.log('downloaded from ' + torrent.swarm.wires.length + ' peers.')
}

function logGetting(thing) {
	console.log('attempting to download: ' + thing)
}
*/
