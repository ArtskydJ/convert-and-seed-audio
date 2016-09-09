var http = require('http')
module.exports = function Upload(file) {
	return {
		to: function (pathname, cb) {
			var post = {
				hostname: 'localhost',
				port: 8080,
				path: pathname,
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Content-Length': file.length
				}
			}
			var req = http.request(post, cb)
			req.end(file)
		}
	}
}
