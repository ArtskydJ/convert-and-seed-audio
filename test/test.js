var test = require('tape')
var ClientInstance = require('../client/instance.js')
var WebTorrent = require('webtorrent')
var ServerInstance = require('../server/instance.js')

function isString(x) {
	return typeof x === 'string'
}

test('ogg file', function (t) {
	var torrenter = new WebTorrent()
	var timeStart = new Date().getTime()
	var timeSeeding = null
	var emitter = ServerInstance(torrenter)
	var client = ClientInstance(torrenter, emitter, isString)
	var filename = __dirname + '/audio/test_1.ogg'

	t.pass('Connecting, Seeding #1')

	emitter.on('uploaded-hashes', client.download)

	client.upload(filename, function onSeed(infhsh) {
		timeSeeding = new Date().getTime()
		var dur = (timeSeeding - timeStart) / 1000
		t.pass('Seeding file #1, took ' + dur + ' seconds.')

		originalInfoHash = infhsh
		emitter.emit('upload', originalInfoHash)
	})

	emitter.on('error', function er(err) {
		t.fail('network error ' + String(err))
		end()
	})

	emitter.on('uploaded-hashes', function ha(infoHashes) {
		var timeHashes = new Date().getTime()
		var dur = (timeHashes - timeSeeding) / 1000

		t.equal(infoHashes.length, 2, '2 info hashes returned, took ' + dur + ' seconds.')

		var ih = infoHashes.map(function (s) { return s.slice(0, 10) }).join('", "')
		var msg = '"' + originalInfoHash + '" is in "' + ih + '"'
		t.notEqual(infoHashes.indexOf(originalInfoHash), -1, msg)
		end()
	})

	function end() {
		clearTimeout(timeout)
		torrenter.destroy()
		t.pass('ending')
		t.end()
	}

	var timeout = setTimeout(function tmt() {
		t.fail('timeout')
		end()
	}, 5 * 60 * 1000) //5 min
	timeout.unref()
})
