var config = require('./config.json').musicRoom
var Sox = require('sox-stream')
var xtend = require('xtend')
var createTagData = require('musicmetadata')
var path = require('path')

function getTagData(stream, meta, cb) {
	var opts = { duration: true, fileSize: meta.size }
	var tagData = createTagData(stream, opts)
	var timeout = setTimeout(finish.bind(null, new Error('timeout')), 5000)
	tagData.once('metadata', finish.bind(null, null))
	tagData.once('done', finish)
	function finish(err, data) {
		tagData.removeAllListeners('done')
		if (err || data) {
			clearTimeout(timeout)
			cb.call(null, err, data || {})
		}
	}
}

function convert(newType, stream, meta) {
	var inputType = path.extname(meta.name)
	var opts = xtend( config.presets[newType], { type: newType })

	return (inputType.toLowerCase() === newType.toLowerCase()) ?
		stream :
		stream.pipe(Sox(opts))
}

module.exports = function multiConvert(stream, meta, cb) {
	var mp3Stream = convert('mp3', stream, meta)
	var oggStream = convert('ogg', stream, meta)

	getTagData(stream, meta, function end(err, tagData) {
		if (err && err.message !== 'Could not find metadata header') {
			cb(err)
		} else {
			console.log('mp3Stream', mp3Stream.toString().slice(0, 80))
			console.log('oggStream', oggStream.toString().slice(0, 80))
			cb(null, tagData, mp3Stream, oggStream)
		}
	})
}
