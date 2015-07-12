var WebTorrent = require('webtorrent')
var ClientInstance = require('../../client/instance.js')
var ServerInstance = require('../../server/instance.js')

module.exports = function setup(t) {
	var torrenter = new WebTorrent()
	var emitter = ServerInstance(torrenter)
	var client = ClientInstance(torrenter, emitter, Boolean)

	function end(err) {
		torrenter.destroy()
		t.notOk(err, err ? String(err) : 'ending')
		t.end()
	}
	emitter.on('error', end)
	var to = setTimeout(end, 100000, 'timeout')
	to.unref && to.unref()

	return {
		emitter: emitter,
		upload: client.upload,
		end: end.bind(null, null)
	}
}
