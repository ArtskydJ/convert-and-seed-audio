var Instance = require('./instance.js')
var shoe = require('shoe')
var emitStream = require('emit-stream')
var JSONStream = require('JSONStream')

module.exports = function casa(server) {
	if (!server) throw new Error('Expected a server object')
	var instance = Instance()
	var onReq = instance.onRequest
	var emitter = instance.emitter
	server.on('request', onReq)
	shoe(function (stream) {
		emitStream(emitter).pipe(JSONStream.stringify()).pipe(stream)
	}).install(server, '/socket')
	return emitter
}
