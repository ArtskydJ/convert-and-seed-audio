var createTagData = require('musicmetadata')

module.exports = function getTagData(stream, size, cb) {
	var opts = { duration: true, fileSize: size }
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

/*function notNull(x) {
	return !x && /object|null/.test(typeof x)
}*/

function multiConvert(stream, meta, cb) {
	var streams = {
		mp3: convert('mp3', stream, meta),
		ogg: convert('ogg', stream, meta)
	}

	getTagData(stream, meta.size, function end(err, tagData) {
		if (err && err.message !== 'Could not find metadata header') {
			cb(err)
		} else {
			console.log(err && err.message === 'Could not find metadata header')
			cb(null, tagData)
		}
	})
}
