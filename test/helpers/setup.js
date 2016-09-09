var WebTorrent = require('webtorrent')
var http = require('http')
var ClientInstance = require('../../client/instance.js')
var ServerInstance = require('../../server/instance.js')

module.exports = function setup(t) {
	var torrenter = new WebTorrent()
	var server = ServerInstance(torrenter)
	var emitter = server.emitter
	var client = ClientInstance(torrenter, emitter, Boolean)

	var listener = http.createServer(server.onRequest)
	listener.listen(8080)

	function end(err) {
		torrenter.destroy()
		t.notOk(err, err ? String(err) : 'ending')
		t.end()
	}
	emitter.on('error', end)
	var to = setTimeout(end, 100000, 'timeout')
	if (to.unref) to.unref()

	return {
		emitter: emitter,
		upload: client.upload,
		end: end.bind(null, null)
	}
}
