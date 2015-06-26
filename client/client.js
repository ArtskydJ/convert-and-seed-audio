var WebTorrent = require('webtorrent')
var shoe = require('shoe')
var emitStream = require('emit-stream')
var JSONStream = require('JSONStream')
var ClientInstance = require('./instance.js')

module.exports = function client()
	var torrenter = new WebTorrent()
	var stream = shoe('/socket').pipe(JSONStream.parse([true]))
	var emitter = emitStream(stream)
	return ClientInstance(torrenter, emitter)
}
