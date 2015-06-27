var MB = 1024 * 1024
var MAX_MB = 15
//Rule of thumb: 1mb/min (give or take)
//1mb = 1,000,000 bytes

function invalid(meta) {
	if (!meta) {
		return new Error('Must supply a file.')
	} else if (typeof meta.size !== 'number') {
		return new Error('Expected file size attribute to be a number.')
	} else if (typeof meta.type !== 'string') {
		return new Error('Expected file type attribute to be a string.')
	} else if (meta.size > MAX_MB * MB) {
		return new Error('Expected file is ' + (meta.size / MB) + 'mb. Max allowed is ' + MAX_MB + 'mb.')
	} else if (meta.type.indexOf('audio') === 0) {
		return new Error('Expected file is not an audio file.')
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
