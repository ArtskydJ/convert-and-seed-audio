function noop() {}

module.exports = function MockWebTorrent() {
	var seeding = {}
	var downloading = {}

	var interval = setInterval(noop, 1000)

	function destroy() {
		console.log('torrenter.destroy()')

		clearInterval(interval)
	}

	function remove(infoHash) {
		console.log('torrenter.destroy()')

		delete seeding[infoHash]
		delete downloading[infoHash]
	}

	function seed(files, cb) {
		console.log('torrenter.seed()')
		if (downloading[infoHash]) throw new Error('already downloading')

		var torrent = FakeTorrent( ensureArray(files) )
		seeding[infoHash] = torrent
		setTimeout(cb, 0, torrent)
	}

	function download(infoHash, config, cb) {
		if (typeof config === 'function') {
			cb = config
			config = {}
		}
		console.log('torrenter.download/add()')
		if (seeding[infoHash]) throw new Error('already seeding')

		downloading[infoHash] = FakeTorrent()
	}

	function FakeTorrent() {
		return {}
	}

	return {
		destroy: destroy,
		remove: remove,
		seed: seed,
		add: download,
		download: download
	}
}


function ensureArray(thing) {
	return (Array.isArray(thing)) ? thing : [thing]
}
