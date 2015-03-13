var Instance = require('./server/instance.js')
var WebTorrent = require('webtorrent')
var shoe = require('shoe')
var http = require('http')
var emitStream = require('emit-stream')
var JSONStream = require('JSONStream')

var torrenter = new WebTorrent()
var emitter = Instance(torrenter)
var sock = shoe(function (stream) {
	emitStream(emitter)
		.pipe(JSONStream.stringify())
		.pipe(stream)
})
var server = http.createServer()

sock.install(server, '/socket')
server.listen(8080)
