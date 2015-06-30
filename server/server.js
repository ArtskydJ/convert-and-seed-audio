var Instance = require('./instance.js')
var shoe = require('shoe')
var http = require('http')
var emitStream = require('emit-stream')
var JSONStream = require('JSONStream')
try {
	global.WRTC = require('wrtc')
	global.WEBTORRENT_ANNOUNCE = [ 'wss://tracker.webtorrent.io' ]
} catch (e) {
	console.warn('Cannot connect to browser peers.', e.message)
}
var WebTorrent = require('webtorrent')

module.exports = function casa(server) {
	if (!server) server = http.createServer()
	var emitter = Instance(new WebTorrent())
	shoe(function (stream) {
		emitStream(emitter).pipe(JSONStream.stringify()).pipe(stream)
	}).install(server, '/socket')
	return server
}
