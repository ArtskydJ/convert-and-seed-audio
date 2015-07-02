convert-and-seed-audio
==========

[![Build Status](https://travis-ci.org/ArtskydJ/convert-and-seed-audio.svg)](https://travis-ci.org/ArtskydJ/convert-and-seed-audio)
[![Dependency Status](https://david-dm.org/artskydj/convert-and-seed-audio.svg)](https://david-dm.org/artskydj/convert-and-seed-audio)
[![devDependency Status](https://david-dm.org/artskydj/convert-and-seed-audio/dev-status.svg)](https://david-dm.org/artskydj/convert-and-seed-audio#info=devDependencies)

# example

*server.js*

```js
var casa = require('convert-and-seed-audio')
var http = require('http')
var ecstatic = require('ecstatic')

var server = http.createServer(ecstatic(__dirname))
casa(server)
server.listen(8080)
```

*client.js*

```js
var createClient = require('convert-and-seed-audio')
var dragDrop = require('drag-drop/buffer')

var client = createClient()

dragDrop('body', function (files) {
	client.upload(files)
})
```

# server api

```js
var casa = require('convert-and-seed-audio')
```

## `var emitter = casa(server)`

- `server` is an [`http.Server`](https://nodejs.org/api/http.html#http_class_http_server) instance. You have to call `server.listen()`.
- `emitter` is an [`events.EventEmitter`](https://nodejs.org/api/events.html#events_class_events_eventemitter) instance. You can call `emitter.on`, if you want.

## events

- `error` (err)
- `upload-request` (infoHash)
- `new-bundle` (bundle)

###### song bundle object

A song bundle object looks like this:

```js
{
	id: '33AE0D80-1ED6-11E5-BE44-7C65CDAD1E06', // uuid
	ogg: '397321422a00076e15dd77dc9516fee37ecdfdef', // info hash
	flac: 'cafc3eba9c2062571430ce428d0c0934c42a0215' // info hash
}
```

# browser api

```js
var createClient = require('convert-and-seed-audio')
```

Written for use with [browserify](https://github.com/substack/node-browserify).

## `var client = createClient()`

### `client.upload(files, [cb])`

- `files` is a file or an array of files.
- `cb(err, infoHashes)`
	- `err` is null or and Error object
	- `infoHashes` is an array of info hashes. If you uploaded one file, it is an array of one info hash.


### `client.download(songBundles)`

- `songBundles` is an array of song bundles, or a song bundle.

### `client.remove(songId)`

- `songId` is the id of the song bundle to remove.

### `var songBundle = client.get(songId)`

- `songId` is the id of the song bundle to return.
- Returns `songBundle`.


# install

With [npm](http://nodejs.org/download) do:

	npm install convert-and-seed-audio

# license

[VOL](http://veryopenlicense.com)
