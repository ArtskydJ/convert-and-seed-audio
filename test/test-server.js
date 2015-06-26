var emitStream = require('emit-stream')
var net = require('net')
var WebTorrent = require('webtorrent')
var JSONStream = require('JSONStream')

var torrenter = new WebTorrent()
var ServerInstance = require('../server/instance.js')
var emitter = ServerInstance(torrenter)

net.createServer(function (stream) {
	emitStream(emitter)
		.pipe(JSONStream.stringify())
		.pipe(stream)
})
