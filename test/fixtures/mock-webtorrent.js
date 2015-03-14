var path = require('path')
var fs = require('fs')

// I think this mock might be too forgiving...

module.exports = function MockWebTorrent() {
	var torrents = {}

	var keepAlive = setInterval(function () {}, 1000)
	function destroy() {
		clearInterval(keepAlive)
	}

	function remove(infoHash) {
		delete torrents[infoHash]
	}

	function seed(files, cb) {
		var torrent = createTorrent(files)
		setTimeout(cb, 0, torrent)
	}

	function download(infoHash, config, cb) {
		if (typeof config === 'function') {
			cb = config
			config = {}
		}
		//throwIfDuplicate(infoHash)
		var torrent = torrents[infoHash] || createTorrent(infoHash)
		setTimeout(cb, 0, torrent)
	}

	function createTorrent(filename) {
		var filenames = ensureArray(filename)
		var infoHash = path.basename(filenames[0])
		var torrent = {
			infoHash: infoHash,
			files: filenames.map(createFile)
		}
		//throwIfDuplicate(infoHash)
		torrents[infoHash] = torrent
		return torrent
	}

	function throwIfDuplicate(infoHash) {
		if (torrents[infoHash]) {
			throw new Error(infoHash + ' torrent already exists.')
		}
	}

	return {
		destroy: destroy,
		remove: remove,
		seed: seed,
		add: download,
		download: download
	}
}

function getBlobURL(filename) {
	return function gbUrl(cb) {
		setTimeout(cb, 0, filename)
	}
}

function createFile(filename) {
	return {
		name: filename,
		getBlobURL: getBlobURL(filename),
		createReadStream: fs.createReadStream.bind(fs, filename)
	}
}

function ensureArray(thing) {
	return (Array.isArray(thing)) ? thing : [thing]
}
