process.browser = true
var fs = require('fs')
var Wt = require('webtorrent')
var c = new Wt()
var thing = 'b913673cc3e0cd7352eed9aeea637b45a70d1123' //:)
c.download(thing, {
	announce: [['wss://tracker.webtorrent.io']]
}, function (torrent) {
	console.log('torrent: ' + torrent.infoHash)
	torrent.files.forEach(function (file) {
		console.log('saving: ' + file.name)
		var src = file.createReadStream()
		var dest = fs.createWriteStream(file.name)
		src.pipe(dest)
	})
})
