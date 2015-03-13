var FileTransfer = require('./client/fileTransfer.js')
var WebTorrent = require('webtorrent')
var shoe = require('shoe')
var emitStream = require('emit-stream')
var JSONStream = require('JSONStream')
var dragDrop = require('drag-drop/buffer') // ('drag-drop')

var torrenter = new Webtorrent()
var transfer = FileTransfer(torrenter)
var emitter = emitStream(
	shoe('/socket')
		.pipe(JSONStream.parse([true]))
)

dragDrop('#dragDropUpload', function (files) {
	transfer.upload(files, function eachfileup(infhsh) {
		emitter.emit('upload', infhsh)
		//emitter.emit.bind(emitter, 'upload')
	})
})

emitter.on('hashes', transfer.download)
