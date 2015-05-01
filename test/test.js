var MOCK = false

var test = require('tape')
var Instance = require('../server/instance.js')
var FileTransfer = require('../client/fileTransfer.js')
var WebTorrent = require(MOCK ? './fixtures/mock-webtorrent.js' : 'webtorrent')

var writeFileSync = require('fs').writeFileSync
var inspect = require('util').inspect
function write(filename, obj) {
	writeFileSync(filename, inspect(obj, { depth: Infinity }))
}

function createTorrenters() {
	var t1 = new WebTorrent()
	var t2 = MOCK ? t1 : new WebTorrent()
	return [ t1, t2 ]
}

function isString(x) {
	return typeof x === 'string'
}

function setUpUploader(torrenter, emitter) {
	var transfer = FileTransfer(torrenter, isString)
	emitter.on('hashes', transfer.download)
	return transfer.upload
}

test('ogg file', function (t) {
	var torrenters = createTorrenters()

	var emitter = Instance(torrenters[0])
	var upload = setUpUploader(torrenters[1], emitter)

	var filename = __dirname + '/audio/test_1.ogg'
	t.pass('Connecting, Seeding #1')
	var timeStart = new Date().getTime()
	var timeSeeding = null
	upload(filename, function onSeed(infhsh) {
		torrenters.forEach(function tfe1(torr, i) {
			write('t' + (i+1) + '.txt', torr)
		})
		timeSeeding = new Date().getTime()
		var dur = (timeSeeding - timeStart) / 1000
		t.pass('Seeding file #1, took ' + dur + ' seconds.')
		originalInfoHash = infhsh
		emitter.emit('upload', originalInfoHash)
	})

	emitter.on('error', function er(err) {
		t.fail(err ? err.message : 'network error')
		end()
	})

	emitter.on('hashes', function ha(infoHashes) {
		console.log('############################## hashes, get it?')
		var timeHashes = new Date().getTime()
		var dur = (timeHashes - timeSeeding) / 1000

		t.equal(infoHashes.length, 2, '2 info hashes returned, took ' + dur + ' seconds.')

		var msg = '"' + originalInfoHash + '" is in "' + infoHashes.join('", "') + '"'
		t.notEqual(infoHashes.indexOf(originalInfoHash), -1, msg)
		end()
	})

	function end() {
		clearTimeout(timeout)
		torrenters.forEach(function tfe2(torr) {
			torr.destroy()
		})
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
