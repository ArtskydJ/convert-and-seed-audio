var crypto = require('crypto')
var SocketIo = require('socket.io')
var WebTorrent = require('webtorrent')
var sox = require('sox-stream')
var xtend = require('xtend')
var path = require('path')
var each = require('async-each')
var createTempFile = require('create-temp-file')
//var Tags = require('./get-tag-data.js')

//configuration
var announce = [ "wss://tracker.webtorrent.io" ]
var formats = ['mp3', 'ogg']

var io = new SocketIo()
//var tags = Tags()
var torrenter = new WebTorrent()

var upcomingSongs = [] //playing and upcoming
server.listen(80)

io.on('connect', function (socket) {
	socket.on('upload', onUpload(function (err, hashes) {
		if (!err) socket.emit('hashes', hashes)
	}))
})

function onUpload(done) {
	return function ou(infHsh) {
		torrenter.download(infHsh, function onTorrent(torrent) {
			console.log('on torrent')
			var file = torrent.files[0]
			if (file) {
				var stream = file.createReadStream()
				each(formats, uploadFormat(file.name, stream), done)
			} else {
				done(new Error('No file found in torrent: ' + torrent && torrent.infoHash))
			}
		}
	}
}

function uploadFormat(filename, stream)
	return function uf(format, next) {
		var tmpFile = createTempFile()
		var converted = convert(format, filename, stream)
		if (converted) {
			converted.pipe(tmpFile).on('finish', function () {
				var newTorrent = torrenter.seed(tmpFile.path, function () {}) //skip the noop?
				next(null, newTorrent.infoHash)
			})
		} else {
			process.nextTick(function () {
				next(torrent.infoHash)
			})
		}
	}
}

function convert(toExt, filename, stream) { //not meta
	var opts = xtend( config.presets[newType], { type: newType })

	return isExtension(toExt, filename) ?
		stream : stream.pipe( sox(opts) )
}

function isExtension(ext1, filename) {
	var ext2 = path.extname(filename)
	return ext1.toLowerCase() === ext2.toLowerCase()
}
