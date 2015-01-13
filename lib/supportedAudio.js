var cfg = require('./config.json').musicRoom

module.exports = function supportedAudio(cb) {
	setTimeout(function () {
		try {
			domready(function () { //call back with the most likely file-type:
				cb(cfg.fileTypes.map(likelihood).sort()[0])
			})
		} catch (e) {
			cb(cfg.defaultFileType)
		}
	}, 0)

	function likelihood(ext) {
		return document.getElementById('playAudio').canPlayType('audio/' + ext).length
	}
}
