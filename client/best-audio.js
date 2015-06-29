module.exports = function best(extensions, defaultExtension) {
	try {
		return extensions.map(ratePlayability).sort()[0]
	} catch (e) {
		return defaultExtension
	}
}

function ratePlayability(ext) {
	var playAudio = document.getElementById('playAudio')
	return playAudio.canPlayType('audio/' + ext).length
}
