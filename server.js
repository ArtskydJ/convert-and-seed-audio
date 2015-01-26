var crypto = require('crypto')
var EventEmitter = require('events').EventEmitter
var shoe = require('shoe')
var http = require('http')
var emitStream = require('emit-stream')
var JSONStream = require('JSONStream')
var WebTorrent = require('webtorrent')
var sox = require('sox-stream')
var xtend = require('xtend')
var path = require('path')
var each = require('async-each')
var createTempFile = require('create-temp-file')
var cfg = require('./lib/config.json')

//configuration
var announce = [ "wss://tracker.webtorrent.io" ]
var formats = ['mp3', 'ogg']

var torrenter = new WebTorrent()
var emitter = new EventEmitter

if (!process.env.test) { //not test
	var sock = shoe(function (stream) {
		emitStream(emitter)
			.pipe(JSONStream.stringify())
			.pipe(stream)
	})
	var server = http.createServer()
	server.listen(8080)
	sock.install(server, '/socket')
} else { //test
	module.exports = emitter
	emitter.on('test_shut_down', function tsd() {
		//console.log('server shutting down!')
		torrenter.destroy()
	})
}

var upcomingSongs = [] //playing and upcoming

emitter.on('upload', function (infHsh) {
	torrenter.download(xtend(
		cfg.webtorrent,
		{infoHash: infHsh}
	), onTorrent(function finished(err, hashes) {
		err ?
			emitter.emit('hashes', hashes) :
			console.error('upload error: ' + err.message)
	}))
})

function onTorrent(cb) {
	return function ot(torrent) {
		console.log('on torrent')
		var file = torrent.files[0]
		if (file) {
			var stream = file.createReadStream()
			each(formats, uploadFormat(file.name, stream), cb)
		} else {
			cb(new Error('No file found in torrent: ' + torrent && torrent.infoHash))
		}
	}
}

function uploadFormat(filename, stream) {
	return function uf(format, next) {
		console.log('CONVERTING')
		var tmpFile = createTempFile()
		var converted = convert(format, filename, stream)
		if (converted) {
			converted.pipe(tmpFile).on('finish', function () {
				var newTorrent = torrenter.seed([tmpFile.path], function () {}) //skip the noop?
				next(null, newTorrent.infoHash)
			})
		} else {
			process.nextTick(function () {
				next(torrent.infoHash)
			})
		}
	}
}

function convert(toExt, filename, stream) {
	var opts = xtend( cfg.presets[newType], { type: newType })

	return isExtension(toExt, filename) ?
		stream : stream.pipe( sox(opts) )
}

function isExtension(ext1, filename) {
	var ext2 = path.extname(filename)
	return ext1.toLowerCase() === ext2.toLowerCase()
}
