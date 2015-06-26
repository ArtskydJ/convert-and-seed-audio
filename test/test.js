var test = require('tape')
var ClientInstance = require('../client/instance.js')
var WebTorrent = require('webtorrent')
var ServerInstance = require('../server/instance.js')

function isString(x) {
	return typeof x === 'string'
}

function shorten(s) {
	return s.slice(0, 6)
}

var startTime = new Date().getTime()
function timeDiff() {
	var endTime = new Date().getTime()
	var duration = (endTime - startTime) / 1000
	startTime = endTime
	return duration
}

test('ogg file', function (t) {
	var torrenter = new WebTorrent()
	var emitter = ServerInstance(torrenter)
	var upload = ClientInstance(torrenter, emitter, isString)
	var filename = __dirname + '/audio/test_1.ogg'

	var originalInfoHash = null

	t.pass('Connecting, Seeding #1')

	upload(filename, function onSeed(infhsh) {
		t.pass('seeding ' + timeDiff() + ' sec')
		originalInfoHash = infhsh
		emitter.emit('upload', originalInfoHash)
	})

	emitter.on('error', function er(err) {
		t.fail('network error ' + String(err))
		end()
	})

	emitter.on('uploaded-bundle', function ha(bundle) {
		var keys = Object.keys(bundle)
		var infoHashes = keys.map(function (key) { return bundle[key] })

		t.pass('uploaded ' + timeDiff() + ' sec')
		t.equal(keys.length, 2, '2 info hashes returned')

		var ih = infoHashes.map(shorten).join('", "')
		var msg = '"' + shorten(originalInfoHash) + '" is in "' + ih + '"'
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
