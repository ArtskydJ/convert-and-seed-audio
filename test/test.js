var test = require('tape')
var Instance = require('../server/instance.js')
var FileTransfer = require('../client/fileTransfer.js')
var WebTorrent = require('./fixtures/mock-webtorrent.js')

function setUpUploader(mockWebTorrent, emitter) {
	var transfer = FileTransfer(mockWebTorrent)
	emitter.on('hashes', transfer.download)
	emitter.on('test_shut_down', transfer.shutdown)
	return transfer.upload
}

test('ogg file', function (t) {
	var mockWebTorrent = new WebTorrent()
	var emitter = Instance(mockWebTorrent, true)
	var upload = setUpUploader(mockWebTorrent, emitter)

	var file = __dirname + '/audio/test_1.ogg'
	t.pass('Connecting, Seeding #1')
	var timeStartUpload = new Date().getTime()
	upload(file, function onSeed(infhsh) {
		var timeSeeding = new Date().getTime()
		var dur = (timeSeeding - timeStartUpload) / 1000
		t.pass('Seeding file #1, took ' + dur + ' seconds.')
		originalInfoHash = infhsh
		emitter.emit('upload', originalInfoHash)
	})

	emitter.on('error', function (err) {
		t.fail(err ? err.message : 'network error')
		end()
	})

	emitter.on('hashes', function (err, infoHashes) { // This never fires...
		var timeHashes = new Date().getTime()
		var dur = (timeHashes - timeSeeding) / 1000
		t.notOk(err, err ? err.message : 'no error')
		t.equal(infoHashes.length, 2, '2 info hashes returned, took ' + dur + ' seconds.')
		t.notEqual(infoHashes.indexOf(originalInfoHash), -1, 'does not have original info hash')
		end()
	})

	function end() {
		clearTimeout(timeout)
		emitter.emit('test_shut_down')
		t.pass('ending')
		t.end()
	}

	var timeout = setTimeout(function tmt() {
		t.fail('timeout')
		end()
	}, 5 * 60 * 1000) //5 min

	timeout.unref()
})



/*
test('wav file', {timeout:60000}, function (t) {
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
})
*/
