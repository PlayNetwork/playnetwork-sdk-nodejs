# v1.0.6 - 2016/03/11

* Added support for [coveralls.io](https://coveralls.io) and [travis-ci](https://travis-ci.org)
* Added `device` sub-module
* Added `options` to root `playnetwork` module

# v1.0.5 - 2016/03/07

* Added `content` sub-module

# v1.0.4 - 2016/03/04

* Added more documentation for usage
* Added `settings` sub-module

# v1.0.3 - 2016/03/01

* Replaced usages of `throw` with `Promise.reject`
* Added `playback` sub-module

# v1.0.2 - 2016/02/29

* Fleshed out more documentation for `music` sub-module
* Added `createBroadcast` and `deleteBroadcast` to `music` sub-module with tests
* Added `allPlaylists`, `createPlaylist` and `deletePlaylist` to `music` sub-module with tests
* Added `addPlaylistTrack`, `checkPlaylistTrack`, `deletePlaylistTrack` and `updatePlaylist` to `music` sub-module with tests

# v1.0.1 - 2016/02/26

* Added object bracket notation conversion for query filters and sort parameters
* Added validation of parameters for internal `http.request` abstraction
* Added retry logic to internal `http.request` abstraction
* Added `#coalesce` function to `validation` module
* Added `#promiseOrCallback` function to `validation` module
* Added `key` sub-module with tests
* Added `music` sub-module with tests

# v1.0.0 - 2016/02/16

* Initial release
