var Instance = require('./instance.js')
var shoe = require('shoe')
var emitStream = require('emit-stream')
var JSONStream = require('JSONStream')
try {
	global.WRTC = require('wrtc')
	global.WEBTORRENT_ANNOUNCE = [ 'wss://tracker.webtorrent.io' ]
} catch (e) {
	console.warn('Cannot connect to browser peers.', e.message)
}
var WebTorrent = require('webtorrent')

// No way to do torrenter.destroy()
module.exports = function casa(server) {
	if (!server) throw new Error('Expected a server object')
	var torrenter = new WebTorrent()
	var emitter = Instance(torrenter)
	shoe(function (stream) {
		emitStream(emitter).pipe(JSONStream.stringify()).pipe(stream)
	}).install(server, '/socket')
	return emitter
}
