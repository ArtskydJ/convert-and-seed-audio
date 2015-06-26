var WebTorrent = require('webtorrent')
var shoe = require('shoe')
var emitStream = require('emit-stream')
var JSONStream = require('JSONStream')
var dragDrop = require('drag-drop/buffer') // ('drag-drop')
var ClientInstance = require('./instance.js')

var torrenter = new WebTorrent()
var emitter = emitStream(
	shoe('/socket')
		.pipe(JSONStream.parse([true]))
)

var client = ClientInstance(torrenter)

emitter.on('uploaded-hashes', client.download)

dragDrop('#dragDropUpload', function (files) {
	client.upload(files, function eachfileup(infhsh) {
		emitter.emit('upload', infhsh)
	})
})
