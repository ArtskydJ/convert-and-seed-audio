# client:

- when they submit a song
	- tell the server about the song (it must queue/distribute songs)

- when told to seed a song
	- start seeding.

- when told to upload a song
	- upload it to the server

- when told to download/seed a song:
	- download the song
	- if compliant, seed the song


# server:

- how to calculate bitrate
	- blob.type (ensure mp3)
	- blob.size (in bytes)
	- use https://github.com/leetreveil/musicmetadata to get the duration (in sec)
	- 

- when told about a song
	- check if the song needs to be transcoded **OR** if there are non-compliant clients
		- tell the client to upload the song
	- else
		- tell the client to seed the song

- when a song is uploaded
	- convert it to mp3
	- host the converted file
	- tell original client to download/seed it
	- tell non-compliant clients to download/seed it


# both:

- using socket.io
- a connection will be provided
