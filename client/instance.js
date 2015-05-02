var FileTransfer = require('./fileTransfer.js')
var validFile = require('./fileValidity.js').valid

module.exports = function ClientInstance(torrenter, emitter, valid) {
	valid = valid || validFile
	var transfer = FileTransfer(torrenter, valid)
	emitter.on('hashes', transfer.download)
	return transfer.upload
}
