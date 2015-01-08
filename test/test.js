var test = require('tape')
var Webtorrent = require('webtorrent')
process.env.test = true

test('ogg file', function (t) { //Infinity
	var webtorr = new Webtorrent()
	var emitter = {on:function(){},emit:function(){}}//require('../')
	var originalInfoHash = ''

//on connect (send 'connect' event?)
	var file = __dirname + '/audio/test_1.ogg'
	t.pass('Connecting, Seeding #1')
	var timeStartSeed = process.uptime()
	webtorr.seed(file, function onSeed(torrent) {
		t.pass(
			'Seeding file #1, took ' +
			(process.uptime() - timeStartSeed) +
			' seconds.'
		)
		originalInfoHash = torrent.infoHash
		emitter.emit('upload', originalInfoHash)
	})
//on connect

	emitter.on('error', function (err) {
		t.fail(err.message || 'network error')
		end()
	})

	emitter.on('hashes', function (err, infoHashes) {
		t.notOk(err, err ? err.message : 'no error')
		t.equal(infoHashes.length, 2, '2 info hashes returned')
		t.notEqual(infoHashes.indexOf(originalInfoHash), -1, 'does not have original info hash')
		end()
	})

	function end() {
		clearTimeout(timeoutId)
		emitter.emit('test_shut_down')
		webtorr.destroy()
		t.end()
	}

	var timeoutId = setTimeout(function tmt() {
		t.fail('timeout')
		end()
	}, 2 * 6+0 * 1000) //2 min
})

/*test('wav file', {timeout:60000}, function (t) {
	var webtorr = new Webtorrent()
	var emitter = require('../')
	var originalInfoHash = ''

//on connect
	webtorr.seed(__dirname + '/audio/test_2.wav', function (torrent) {
		originalInfoHash = torrent.infoHash
		emitter.emit('upload')
	})

	emitter.on('hashes', function (err, infoHashes) {
		t.notOk(err, err? err.message : 'no error')
		t.equal(infoHashes.length, 2, '2 info hashes returned')
		t.equal(infoHashes.indexOf(originalInfoHash), -1, 'does not have original info hash')
		end()
	})

	function end() {
		t.end()
		webtorr.destroy()
		clearTimeout(timeoutId)
	}

	var timeoutId = setTimeout(function tmt() {
		t.fail('timeout')
		end()
	}, 2 * 60 * 1000) //2 min
})*/


