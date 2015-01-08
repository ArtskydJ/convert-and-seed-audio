var TEST_MODE = false
process.env.test = TEST_MODE
var test = require('tape').test
var Dnode = require('dnode')
var Shoe = require('shoe')
var Webtorrent = require('webtorrent')

function append(str) { document.getElementById('log').innerHTML += str }
console.log =   function (str) { append(str + '\n') }
console.error = function (str) { append('<b>ERROR!</b> ' + str + '\n') }

test('ogg file', { timeout: Infinity }, function (t) {
	var d = Dnode()
	var stream = Shoe('/dnode')
	var torrenter = new Webtorrent()
	var originalInfoHash = ''

	d.on('remote', function (remote) {
		var file = __dirname + '/audio/test_1.ogg'
		console.log('CONNECTED')
		console.time('SEEDING #1')
		torrenter.seed(file, function (torrent) {
			console.timeEnd('SEEDING #1')
			originalInfoHash = torrent.infoHash
			io.emit('upload', originalInfoHash)
		})

		remote.connected() //tell the server that you're connected

		remote.hashes(function (err, infoHashes) {
			t.notOk(err, err? err.message : 'no error')
			t.equal(infoHashes.length, 2, '2 info hashes returned')
			t.notEqual(infoHashes.indexOf(originalInfoHash), -1, 'does not have original info hash')
			t.end()
		})
	})
	d.pipe(stream).pipe(d)

	d.on('error', function (err) {
		t.fail(err.message || 'dnode error')
		t.end()
	})
})

test('wav file', { timeout: 60 * 1000 }, function (t) {
	var d = Dnode()
	var stream = Shoe('/dnode')
	var torrenter = new Webtorrent()
	var originalInfoHash = ''

	io.on('connect', function () {
		torrenter.seed(__dirname + '/audio/test_2.wav', function (torrent) {
			originalInfoHash = torrent.infoHash
			io.emit('upload')
		})

		remote.hashes(function (err, infoHashes) {
			t.notOk(err, err? err.message : 'no error')
			t.equal(infoHashes.length, 2, '2 info hashes returned')
			t.equal(infoHashes.indexOf(originalInfoHash), -1, 'does not have original info hash')
			t.end()
		})
	})
})
