var xtend = require('xtend')
var supportedAudio = require('./supportedAudio.js')
var cfg = require('../config.json')
var dupe = require('dupe')
var KeyMaster = require('key-master')

module.exports = function ft(torrenter, valid) {
	var storage = new KeyMaster(function () {})
	var preferredFileType = cfg.defaultExtension
	supportedAudio(function (type) {
		preferredFileType = type
	})

	function download(songBundles) {
		ensureArray(songBundles).filter(dupe).forEach(function dl(songBundle) {
			var infoHash = songBundle
			var id = songBundle
			torrenter.download(infoHash, cfg.webtorrent, function ontorrent(torrent) {
				var file = torrent.files[0]
				file.getBlobURL(function callback (err, url) { // this makes like no sense
					storage.set(id, url)
				})
			})
		})
	}

	function upload(files, cb) { // cb is called for each file
		ensureArray(files).filter(valid).forEach(function (file) {
			//var meta = copyProperties(file, ['name', 'size', 'type'])
			torrenter.seed(file, function onseed(torrent) {
				cb(torrent.infoHash)
			})
		})
	}

	function remove(songId) {
		torrenter.remove(songId)
		storage.remove(songId)
	}

	return {
		download: download,
		upload: upload,
		get: storage.get,
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
