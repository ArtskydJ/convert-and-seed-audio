var extensions = require('../config.json').extensions
var domready = require('domready')

module.exports = function best() {
	return extensions.map(ratePlayability).sort()[0]
}

function ratePlayability(ext) {
	var playAudio = document.getElementById('playAudio')
	var playability = playAudio.canPlayType('audio/' + ext).length
	return playability
}
