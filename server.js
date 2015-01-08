var TEST_MODE = !!process.env.test
var crypto = require('crypto')
var http = require('http')
var Shoe = require('shoe')
var Dnode = require('dnode')
var WebTorrent = require('webtorrent')
var sox = require('sox-stream')
var xtend = require('xtend')
var path = require('path')
var each = require('async-each')
var ecstatic = require('ecstatic')
var createTempFile = require('create-temp-file')

//configuration
var announce = [ "wss://tracker.webtorrent.io" ]
var formats = ['mp3', 'ogg']

//var tags = Tags()
var torrenter = new WebTorrent()
if (TEST_MODE) module.exports = io

var upcomingSongs = [] //playing and upcoming

var inNodeWebkit = !!process.env.node
if (inNodeWebkit) {
	function append(str) { document.getElementById('log').innerHTML += str }
	console.log =   function (str) { append(str + '<br>') }
	console.error = function (str) { append('<b>ERROR!</b> ' + str + '<br>') }
}
console.log('Test mode: ' + TEST_MODE)
console.log('Navigate to http://localhost:9999/')

var server = http.createServer(ecstatic({root:__dirname}))
server.listen(9999)
var sock = Shoe(function (stream) {
	var d = Dnode({
		connect: console.log.bind(null, 'CONNECTED'),
		upload: upload
	})
	d.pipe(stream).pipe(d)
})
sock.install(server, '/dnode')

function upload(done) {
	return function ou(infHsh) {
		var n = Number(infHsh[0] !== 'c') + 1
		console.log('DOWNLOADING #' + n)
		torrenter.download(infHsh, function onTorrent(torrent) {
			console.log('on torrent')
			var file = torrent.files[0]
			if (file) {
				var stream = file.createReadStream()
				each(formats, uploadFormat(file.name, stream), done)
			} else {
				done(new Error('No file found in torrent: ' + torrent && torrent.infoHash))
			}
		})
	}
}

function uploadFormat(filename, stream) {
	return function uf(format, next) {
		console.log('CONVERTING')
		var tmpFile = createTempFile()
		var converted = convert(format, filename, stream)
		converted ?
			converted.pipe(tmpFile).on('finish', function () {
				var newTorrent = torrenter.seed([tmpFile.path], function () {}) //skip the noop? why the arr?
				next(null, newTorrent.infoHash)
			})
		:
			process.nextTick(function () {
				next(null, torrent.infoHash)
			})
	}
}

function convert(toExt, filename, stream) {
	var opts = xtend( config.presets[newType], { type: newType })
	return isExtension(toExt, filename) ? stream : stream.pipe( sox(opts) )
}

function isExtension(ext1, filename) {
	var ext2 = path.extname(filename)
	return ext1.toLowerCase() === ext2.toLowerCase()
}
