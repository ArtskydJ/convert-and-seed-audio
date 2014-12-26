var test = require('tap').test
var SocketIo = require('socket.io-client')
var torrenter = require('webtorrent')
var spawn = require('child_process').spawn

function spawnServer() {
	spawn('node', ['server.js'], {cwd:'..'})
}

test('ogg file', function (t) {
	spawnServer()
	var io = SocketIo('http://localhost/users')
	var originalInfoHash = ''

	io.on('connect', function () {
		torrenter.seed('./audio/test_1.ogg', function (torrent) {
			originalInfoHash = torrent.infoHash
			io.emit('upload')
		})
	})

	io.on('hashes', function (err, infoHashes) {
		t.notOk(err, err? err.message : 'no error')
		t.equal(infoHashes.length, 2, '2 info hashes returned')
		t.notEqual(infoHashes.indexOf(originalInfoHash), -1, 'does not have original info hash')
		t.end()
	})
})

test('wav file', function (t) {
	spawnServer()
	var io = SocketIo('http://localhost/users')
	var originalInfoHash = ''

	io.on('connect', function () {
		torrenter.seed('./audio/test_2.wav', function (torrent) {
			originalInfoHash = torrent.infoHash
			io.emit('upload')
		})
	})

	io.on('hashes', function (err, infoHashes) {
		t.notOk(err, err? err.message : 'no error')
		t.equal(infoHashes.length, 2, '2 info hashes returned')
		t.equal(infoHashes.indexOf(originalInfoHash), -1, 'does not have original info hash')
		t.end()
	})
})
