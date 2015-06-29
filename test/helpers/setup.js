var WebTorrent = require('webtorrent')
var ClientInstance = require('../../client/instance.js')
var ServerInstance = require('../../server/instance.js')

function fileValidator(x) {
	return typeof x === 'string'
}

module.exports = function setup(t) {
	var torrenter = new WebTorrent()
	var emitter = ServerInstance(torrenter)
	var client = ClientInstance(torrenter, emitter, fileValidator)

	function end(err) {
		torrenter.destroy()
		t.notOk(err, err ? String(err) : 'ending')
		t.end()
	}
	emitter.on('error', end)
	setTimeout(end, 60000, 'timeout').unref()

	return {
		emitter: emitter,
		upload: client.upload,
		end: end.bind(null, null)
	}
}
