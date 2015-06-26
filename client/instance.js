var xtend = require('xtend')
var bestAudioFileType = require('./best-audio-node.js')
var webtorrentConfig = require('../config.json').webtorrent
//var dupe = require('dupe')
var validFile = require('./file-validity.js').valid

module.exports = function ft(torrenter, emitter, valid) {
	var storage = {}
	var preferredFileType = bestAudioFileType()

	emitter.on('uploaded-hashes', function (hashes) {
		download(hashes) // turn hases into a bundle? should a bundle be emitted instead?
	})

	function download(songBundles) {
		console.log('DONWLODN:', songBundles)
		ensureArray(songBundles).forEach(function dl(songBundle) {
			console.log('song bundle:', songBundle)
			//console.log('prefered song:')
			//console.log(songBundle[preferredFileType])
			var infoHash = songBundle //[preferredFileType]
			//console.log('INFOHASH:', infoHash)
			var id = songBundle //.id
			torrenter.download(infoHash, webtorrentConfig, saveSong(id))
		})
	}

	function upload(files, cb) {
		console.log('UPLAOD', files)
		ensureArray(files).filter(valid || validFile).forEach(function (file) {
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
