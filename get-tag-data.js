var createTagData = require('musicmetadata')
var once = require('onetime')

module.exports = function getTagData(stream, size, callback) {
	var cb = once(callback)
	var opts = { duration: true, fileSize: size }
	var tagData = createTagData(stream, opts)
	
	setTimeout(cb.bind(null, new Error('timeout')), 5000)
	tagData.once('metadata', cb.bind(null, null))
	tagData.once('done', cb)
}

//'Could not find metadata header'
