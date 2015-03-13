var MB = 1024 * 1024
var MAX_MB = 15
//Rule of thumb: 1mb/min (give or take)
//1mb = 1,000,000 bytes

function invalid(meta) {
	if (!meta) {
		return new ReferenceError('Must supply a file, supplied ' + meta + '.')
	} else if (!meta.size) {
		return new ReferenceError('Supplied file does not have size attribute: ' + meta.size)
	} else if (!meta.type) {
		return new ReferenceError('Supplied file does not have type attribute: ' + meta.type)
	} else if (typeof meta.size !== 'number') {
		return new TypeError('Supplied file\'s size attribute is a ' + typeof size + ', but is expected to be a number.')
	} else if (typeof meta.type !== 'string') {
		return new TypeError('Supplied file\'s type attribute is a ' + typeof size + ', but is expected to be a string.')
	} else if (meta.size > MAX_MB * MB) {
		return new TypeError('Supplied file is ' + (meta.size / MB) + ' megabytes which is larger than the max of ' + MAX_MB + ' megabytes.')
	} else if (meta.type.split('/')[0] !== 'audio') {
		return new Error('Supplied file is a ' + meta.type.split('/')[0] + ' file, not an audio file.')
	} else {
		return null
	}
}

function valid(meta) {
	return !invalid(meta)
}

module.exports = {
	invalid: invalid,
	valid: valid
}
