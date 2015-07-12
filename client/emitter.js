var shoe = require('shoe')
var emitStream = require('emit-stream')
var JSONStream = require('JSONStream')

module.exports = function Emitter() {
	var stream = shoe('/socket').pipe(JSONStream.parse([true]))
	return emitStream(stream)
}
