var Instance = require('./instance.js')
var shoe = require('shoe')
var emitStream = require('emit-stream')
var JSONStream = require('JSONStream')
var multiplex = require('multiplex')

module.exports = function casa(server) {
	if (!server) throw new Error('Expected a server object')
	var emitter = new EventEmitter()
	shoe(function (stream) {

		var plex = multiplex()
		plex.pipe(stream)

		var emitterStream = plex.createStream('emitter')
		var filesStream = plex.createStream('files')

		emitStream(emitter).pipe(JSONStream.stringify()).pipe(emitterStream)

		Instance(emitter, filesStream)

	}).install(server, '/socket')
	return emitter
}
