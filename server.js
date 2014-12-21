var http = require('http')
var crypto = require('crypto')
var Socket = require('socket.io')
var WebTorrent = require('webtorrent')
var Convertor = require('./convert.js')
var announce = [ "wss://tracker.webtorrent.io" ] //put this in a config?

config.ecstatic.root = process.cwd() + config.ecstatic.root
var serve = Ecstatic(config.ecstatic)
var server = http.createServer(serve)
var io = Socket(server)
var convert = Convertor()
var torrenter = new WebTorrent()

var upcomingSongs = [] //playing and upcoming
server.listen(80)

io.sockets.on('connect', function co(socket) {
	socket.on('upload', function up(stream, meta, fnReturn) {
		console.log('on upload')
		convert(stream, meta, function (err, tagData, mp3Stream, oggStream) {
			console.log('done converting,', err)
			if (!err) {
				//torrenter.seed(mp3)
				//torrenter.seed(ogg)
				//get both infohashes
				//give em to the client
				stream.pipe(crypto.createHash('md5'))
					.on('finish', function (md5) {
						var songId = 'songid_' + md5.toString('hex')
						console.log(songId)
						fnReturn(songId, tagData, mp3Ih, oggIh) //bad idea?
					})
			}
		})
	})
})

//get rid of socket.io if possible
//implement webtorrent
