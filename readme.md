convert-and-seed-audio
==========

[![Build Status](https://travis-ci.org/ArtskydJ/convert-and-seed-audio.svg)](https://travis-ci.org/ArtskydJ/convert-and-seed-audio)
[![Dependency Status](https://david-dm.org/artskydj/convert-and-seed-audio.svg)](https://david-dm.org/artskydj/convert-and-seed-audio)
[![devDependency Status](https://david-dm.org/artskydj/convert-and-seed-audio/dev-status.svg)](https://david-dm.org/artskydj/convert-and-seed-audio#info=devDependencies)

# example

*server.js*

```js
var createServer = require('convert-and-seed-audio')
var ecstatic = require('ecstatic')

var server = createServer(ecstatic(__dirname))
server.listen(8080)
```

*client.js*

```js
var createClient = require('convert-and-seed-audio')
var dragDrop = require('drag-drop/buffer')

var upload = createClient()

dragDrop('body', function (files) {
	upload(files)
})
```

# server api

```js
var createServer = require('convert-and-seed-audio')
```

## `var server = createServer([requestListener])`

`createServer` is like [`http.createServer`](https://nodejs.org/api/http.html#http_http_createserver_requestlistener)

## `server`

`server` is an instance of [`http.Server`](https://nodejs.org/api/http.html#http_class_http_server). You have to call `server.listen()`.

# browser api

```js
var createClient = require('convert-and-seed-audio')
```

Written for use with [browserify](https://github.com/substack/node-browserify).

## `var upload = createClient()`

## `upload(files, [cb])`

- `files` is a file or an array of files.
- `cb(err, infoHashes)`
	- `err` is null or and Error object
	- `infoHashes` is an array of info hashes. If you uploaded one file, it is an array of one info hash.

# install

With [npm](http://nodejs.org/download) do:

	npm install convert-and-seed-audio

# license

[VOL](http://veryopenlicense.com)
