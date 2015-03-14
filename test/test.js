var MOCK = true

var test = require('tape')
var Instance = require('../server/instance.js')
var FileTransfer = require('../client/fileTransfer.js')
var WebTorrent = require(MOCK ? './fixtures/mock-webtorrent.js' : 'webtorrent')


function isString(x) {
	return typeof x === 'string'
}

function setUpUploader(torrenter, emitter) {
	var transfer = FileTransfer(torrenter, isString)
	emitter.on('hashes', transfer.download)
	return transfer.upload
}

test('ogg file', function (t) {
	var torrenter1 = new WebTorrent()
	var torrenter2 = MOCK ? torrenter1 : new WebTorrent()

	var emitter = Instance(torrenter1)
	var upload = setUpUploader(torrenter2, emitter)

	var filename = __dirname + '/audio/test_1.ogg'
	t.pass('Connecting, Seeding #1')
	var timeStartUpload = new Date().getTime()
	var timeSeeding = Infinity
	upload(filename, function onSeed(infhsh) {
		timeSeeding = new Date().getTime()
		var dur = (timeSeeding - timeStartUpload) / 1000
		t.pass('Seeding file #1, took ' + dur + ' seconds.')
		originalInfoHash = infhsh
		emitter.emit('upload', originalInfoHash)
	})

	emitter.on('error', function (err) {
		t.fail(err ? err.message : 'network error')
		end()
	})

	emitter.on('hashes', function (infoHashes) {
		var timeHashes = new Date().getTime()
		var dur = (timeHashes - timeSeeding) / 1000

		t.equal(infoHashes.length, 2, '2 info hashes returned, took ' + dur + ' seconds.')

		var msg = '"' + originalInfoHash + '" is in "' + infoHashes.join('", "') + '"'
		t.notEqual(infoHashes.indexOf(originalInfoHash), -1, msg)
		end()
	})

	function end() {
		clearTimeout(timeout)
		torrenter1.destroy()
		torrenter2.destroy()
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
