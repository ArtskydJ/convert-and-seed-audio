module.exports = function timer() {
	var startTime = new Date().getTime()
	return function timeDiff() {
		var now = new Date().getTime()
		var seconds = (now - startTime) / 1000
		startTime = now
		return seconds
	}
}
