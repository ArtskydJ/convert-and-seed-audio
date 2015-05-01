var xtend = require('xtend')
var supportedAudio = require('./supportedAudio.js')
var validFile = require('./fileValidity.js').valid
var cfg = require('../config.json')
var dupe = require('dupe')

module.exports = function ft(torrenter, valid) {
	valid = valid || validFile
	var storage = {}
	var preferredFileType = cfg.defaultExtension
	supportedAudio(function (type) {
		preferredFileType = type
	})

	function download(songBundles) {
		ensureArray(songBundles).filter(dupe).forEach(function dl(songBundle) {
			//console.log('sb:')
			//console.log(songBundle)
			//console.log('pft:')
			//console.log(songBundle[preferredFileType])
			var infoHash = songBundle //[preferredFileType]
			console.log('INFOHASH:', infoHash)
			var id = songBundle //.id
			torrenter.download(infoHash, cfg.webtorrent, saveSong(id))
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
		torrenter.remove(storage) // What?
		return (delete storage[songId])
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

	return {
		download: download,
		upload: upload,
		get: get,
		remove: remove
	}
}

/*
function copyProperties(src, keys) {
	return ensureArray(keys).reduce(function (dest, key) {
		dest[key] = src[key]
		return dest
	}, {})
}
*/

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
