var Webtorrent = require('webtorrent')
var xtend = require('xtend')
var supportedAudio = require('./supportedAudio.js')
var validFile = require('./fileValidity.js').valid
var cfg = require('./config.json')

var torrenter = new Webtorrent()
function valid(x) {
	return (process.env.test && typeof x === 'string') || validFile(x)
}

module.exports = function () {
	var storage = {}
	var preferredFileType = cfg.defaultFileType
	supportedAudio(function (type) {
		preferredFileType = type
	})

	function download(songBundles) {
		ensureArray(songBundles).forEach(function dl() {
			var infoHash = songBundle[preferredFileType]
			var id = songBundle.id
			torrenter.download(xtend(
				cfg.webtorrent,
				{infoHash: infoHash}
			), saveSong(id))
		})
	}

	function upload(files, cb) {
		ensureArray(files).filter(valid).forEach(function (file) {
			//var meta = copyProperties(file, ['name', 'size', 'type'])
			torrenter.seed(file, function onseed(torrent) {
				cb(torrent.infoHash)
			})
		})
	}

	function get(songId) {
		return storage[songId]
	}

	function remove(songId) {
		torrenter.remove(storage)
		return (delete storage[songId])
	}

	function shutdown() {
		//console.log('file transfer shutting down!')
		torrenter.destroy()
	}

	return {
		download: download,
		upload: upload,
		get: get,
		remove: remove,
		shutdown: shutdown
	}
}

function saveSong(id) {
	//logGetting(id)
	return function ontorrent(torrent) {
		//logDownloaded(torrent)
		var file = torrent.files[0]
		file.getBlobURL(function callback (err, url) {
			storage[id] = url
		})
	}
}

function copyProperties(src, keys) {
	return ensureArray(keys).reduce(function (dest, key) {
		dest[key] = src[key]
		return dest
	}, {})
}

function ensureArray(thing) {
	return (Array.isArray(thing)) ? thing : [thing]
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
