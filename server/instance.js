var EventEmitter = require('events').EventEmitter
var Sox = require('sox-stream')
var Busboy = require('busboy')

module.exports = function Instance() {
	var emitter = new EventEmitter()
	return {
		emitter: emitter,
		onRequest: onRequest.bind(null, emitter)
	}
}

function onRequest(emitter, req, res) {
	if (req.method === 'POST' && req.url = '/upload') {
		var busboy = new Busboy({ headers: req.headers })

		function onFinish() {
			// This function is called too many places. Wrap it with `after`?
			// This function is called on convert and not convert... WAT
			res.writeHead(200, { 'Connection': 'close' })
			res.end()
		}

		busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
			var alreadyMp3 = fieldname.slice(-4) === '.mp3'
			if (alreadyMp3) {
				onFinish()
			} else {
				var convert = Sox({ type: 'mp3' })
				file.pipe(convert).pipe(res).on('finish', onFinish)
			}
		})

		busboy.on('finish', onFinish)

		busboy.on('error', emitter.emit.bind(emitter, 'error'))
		req.on('error', emitter.emit.bind(emitter, 'error'))

		req.pipe(busboy)
	}
}
