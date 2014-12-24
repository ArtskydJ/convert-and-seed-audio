var http = require('http')
var crypto = require('crypto')
var Socket = require('socket.io')
var WebTorrent = require('webtorrent')
var sox = require('sox-stream')
var xtend = require('xtend')
var path = require('path')
var Convertor = require('./convert.js')

//configuration
var announce = [ "wss://tracker.webtorrent.io" ]
var formats = ['mp3', 'ogg']

config.ecstatic.root = process.cwd() + config.ecstatic.root
var serve = Ecstatic(config.ecstatic)
var server = http.createServer(serve)
var io = Socket(server)
var convert = Convertor()
var torrenter = new WebTorrent()

var upcomingSongs = [] //playing and upcoming
server.listen(80)

function onTorrent(torrent, cb) {
	console.log('on torrent')
	var file = torrent.files[0]
	if (file) {
		var stream = file.createReadStream()
		var mp3Stream = convert('mp3', file.name, stream)
		var oggStream = convert('ogg', file.name, stream)

		var streams = formats.map(function (format) {
			return convert(format, file.name, stream)
		})

		//torrenter.seed(mp3)
		//torrenter.seed(ogg)
		//get both infohashes
		//give em to the client
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

//get rid of socket.io if possible
//implement webtorrent
