var test = require('tape')
var setup = require('./helpers/setup.js')
var timer = require('./helpers/timer.js')

function shorten(s) {
	return s.slice(0, 6)
}

test('ogg file', function (t) {
	var state = setup(t)
	var timeDiff = timer()
	var filename = __dirname + '/audio/test_1.ogg'
	var originalHash = null

	state.upload(filename, function onSeed(err, infoHash) {
		t.pass('seeding ' + shorten(infoHash) + ': ' + timeDiff() + ' sec')
		originalHash = infoHash
	})

	state.emitter.on('new-bundle', function onbundle(bundle) {
		var keys = Object.keys(bundle)
		var hashes = keys.map(function (key) { return bundle[key] })

		t.pass('uploaded ' + timeDiff() + ' sec')
		t.equal(keys.length, 2, '2 info hashes returned')

		console.log('typeof originalHash:', typeof originalHash)
		var msg = shorten(originalHash) + ' is in ' + hashes.map(shorten).join(', ')
		t.notEqual(hashes.indexOf(originalHash), -1, msg)
		state.end()
	})
})
