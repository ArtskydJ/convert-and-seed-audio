var WebTorrent = require('webtorrent')
var Emitter = require('./emitter.js')
var ClientInstance = require('./instance.js')

// No way to do torrenter.destroy()
module.exports = function Client() {
	var torrenter = new WebTorrent()
	var emitter = Emitter()
	return ClientInstance(torrenter, emitter)
}
