var test = require('tap').test
var SocketIo = require('mock-socket.io').Client
var Webtorrent = require('webtorrent')
var cp = require('child_process')
//var thruMap = require("through2-map")

var torrenter = new Webtorrent()

/*
function prepend(str) {
	return thruMap(function (chunk) {
		return (str || '') + chunk
	})
}

function spawnServer() {
	console.log('LAUNCHING SERVER')
	var srv = cp.spawn('node', ['server.js'])
	srv.stdout.pipe(prepend('SERVER> ')).pipe(process.stdout)
	srv.stderr.pipe(prepend('ERROR> ')).pipe(process.stderr)
}
*/

test('ogg file', {timeout:Infinity}, function (t) {
	//spawnServer()

	//var io = SocketIo('http://localhost/')
	var io = new SocketIo(require('../'))
	var originalInfoHash = ''

	io.on('connect', function () {
		var file = __dirname + '/audio/test_1.ogg'
		console.log('CONNECTED')
		console.time('SEEDING #1')
		torrenter.seed(file, function (torrent) {
			console.timeEnd('SEEDING #1')
			originalInfoHash = torrent.infoHash
			io.emit('upload', originalInfoHash)
		})
	})

	io.on('error', function (err) {
		t.fail(err.message || 'socket.io error')
		t.end()
	})

	io.on('hashes', function (err, infoHashes) {
		t.notOk(err, err? err.message : 'no error')
		t.equal(infoHashes.length, 2, '2 info hashes returned')
		t.notEqual(infoHashes.indexOf(originalInfoHash), -1, 'does not have original info hash')
		t.end()
	})

	io.on('disconnect', function () {
		console.log('DISCONNECT')
		t.end()
	})
})

test('wav file', {timeout:60000}, function (t) {
	//spawnServer()
	//var io = SocketIo('http://localhost:8080/')
	var io = new SocketIo(require('../'))
	var originalInfoHash = ''

	io.on('connect', function () {
		torrenter.seed(__dirname + '/audio/test_2.wav', function (torrent) {
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
