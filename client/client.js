var multiplex = require('multiplex')
var shoe = require('shoe')
var emitStream = require('emit-stream')
var JSONStream = require('JSONStream')
var ClientInstance = require('./instance.js')

module.exports = function Client() {
	var stream = shoe('/socket')
	var plex = multiplex()
	stream.pipe(plex)

	var emitterStream = multiplex.receiveStream('emitter')
	var filesStream = multiplex.receiveStream('files')

	var emitter = emitStream(emitterStream).pipe(JSONStream.parse([true]))

	return ClientInstance(emitter, filesStream)
}
