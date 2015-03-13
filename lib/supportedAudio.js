var cfg = require('./config.json')
var inBrowser = require('in-browser')

module.exports = function supportedAudio(cb) {
	if (inBrowser) {
		console.log('in browser')
		var domready = require('domready')
		domready(function () { //call back with the most likely file-type:
			cb( cfg.fileTypes.map(likelihood).sort()[0] )
		})
	} else {
		process.nextTick(function () {
			cb( cfg.defaultExtension )
		})
	}

	function likelihood(ext) {
		return (
			inBrowser &&
			document.getElementById('playAudio')
				.canPlayType('audio/' + ext).length
		)
	}
}
