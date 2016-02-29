# PlayNetwork Node.js SDK

## Install

**_COMING SOON_**

```bash
npm install playnetwork-sdk
```

## Usage

### Getting Started

* [constructor](constructor)
* [options](options)

### Music API Module

This module can be used to interact with the CURIOMusic API to retrieve content programming and track meta-data.

#### Custom Playlists

* [addPlaylistTracks](#addplaylisttracks)
* [allPlaylists](#allplaylists)
* [checkPlaylistTrack](#checkplaylisttrack)
* [createPlaylist](#createplaylist)
* [deletePlaylistTrack](#deleteplaylisttrack)
* [getPlaylist](#getplaylist)
* [deletePlaylist](#deleteplaylist)
* [updatePlaylist](#updateplaylist)

#### Collections

* [allCollections](#allcollections)
* [getCollection](#getcollection)
* [mixCollection](#mixcollection)

#### Stations

* [allStations](#allstations)
* [getStation](#getstation)

#### Broadcasts

* [allBroadcasts](#allbroadcasts)
* [createBroadcast](#createbroadcast)
* [deleteBroadcast](#deletebroadcast)
* [getBroadcast](#getbroadcast)

#### Tracks

* [allCollectionTracks](#allcollectiontracks)
* [allPlaylistTracks](#allplaylisttracks)
* [allStationTracks](#allstationtracks)
* [allTracks](#alltracks)
* [getTrack](#gettrack)
* [getTracks](#gettracks)

### Getting Started

#### Constructor

The PlayNetwork SDK must be configured with a valid and active `clientId` and `secret` prior to use. If `#configure` is not called, no functionality within the SDK is enabled and all SDK sub-modules (i.e. `music`, `settings`, `content`, etc.) will be `undefined`.

```javascript
var playnetwork = require('playnetwork-sdk');

playnetwork.configure(
  '<CLIENT_ID>',
  '<CLIENT_SECRET>');
```

[back to top](#usage)

#### Options

The PlayNetwork SDK allows for a set of additional configuration parameters to be specified as an optional argument to the `#configure` method. This parameter is fully optional and, by default, all communication occurs with the PlayNetwork production environment.

The supported options are as follows:

* content
  * host
  * secure
* key
  * host
  * secure
  * cacheTokens
* music
  * host
  * secure
* playback
  * host
  * secure

See the following example that configures the SDK for interaction with a sandbox PlayNetwork environment (**_note:** this is an example only).

```javascript
var
  playnetwork = require('playnetwork-sdk'),
  options = {
    content : {
      host : 'sandbox-content-api.apps.playnetwork.com'
    },
    key : {
      host : 'sandbox-key-api.apps.playnetwork.com'
    },
    music : {
      host : 'sandbox-curio-music-api.apps.playnetwork.com'
    },
    playback : {
      host : 'sandbox-playback-api.apps.playnetwork.com'
    }
  };

playnetwork.configure(
  '<CLIENT_ID>',
  '<CLIENT_SECRET>',
  options);

// echo configured settings
console.log(playnetwork.settings());
```

[back to top](#usage)

### Music Module

The music module is designed to simplify interaction with the [PlayNetwork CURIOMusic API](https://curio-music-api.apps.playnetwork.com/v2/docs). This module supports the following methods:

#### #addPlaylistTracks

This method can be used to add tracks to an existing custom playlist.

**Usage:** `client.music.addPlaylistTracks(playlistId, tracks, callback)`

* playlistId - _(required)_ - defines the playlist to which tracks should be added
* tracks - _(required)_ - an array of track objects to add to the playlist
  * _NOTE:_ assetId or legacy.trackToken must be supplied
* callback - _(optional)_ - a function callback that accepts two arguments
  * err - populated with details in the event of an error
  * result - result set details

```javascript
var
  playlistId = '<PLAYLIST_ID>',
  tracks = [{
    assetId : '<ASSET_ID>'
  }, {
    legacy : {
      trackToken : 12345
    }
  }];

client
  .music
  .addPlaylistTracks(playlistId, tracks)
    .then((result) => {
      console.log('successfully added tracks to playlist %s', playlistId);
    })
    .catch((err) => {
      console.error(err);
    });
```

[back to top](#usage)

#### #allBroadcasts

This method can be used to retrieve a paginated result set of broadcasts created for the specified station.

**Usage:** `client.music.allBroadcasts(stationId, options, callback)`

* stationId - _(required)_ - defines the station for which broadcasts should be retrieved
* options - _(optional)_ - can be used to supply additional filters and sorting instructions
  * start - the index at which to start selection of items
  * count - the total number of items to retrieve (maximum value is `100`)
  * filters - additional field projections along with mandatory and optional filters (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
  * sort - additional sorting parameters for result (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
* callback - _(optional)_ - a function callback that accepts two arguments
  * err - populated with details in the event of an error
  * result - result set details

```javascript
var stationId = '<STATION_ID>';

client
  .music
  .allBroadcasts(stationId, {
    start : 0,
    count : 100,
    sort : {
      desc : 'created'
    }
  }).then((result) => {
    console.log(
      'found %d broadcasts for station %s',
      result.total,
      stationId);
  }).catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #allCollections

This method can be used to retrieve a paginated list of collections from the API.

**Usage:** `client.music.allCollections(options, callback)`

* options - _(optional)_ - can be used to supply additional filters and sorting instructions
  * start - the index at which to start selection of items
  * count - the total number of items to retrieve (maximum value is `100`)
  * filters - additional field projections along with mandatory and optional filters (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
  * sort - additional sorting parameters for result (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
* callback - _(optional)_ - a function callback that accepts two arguments
  * err - populated with details in the event of an error
  * result - result set details

```javascript
client
  .music
  .allCollections({
    start : 0,
    count : 100,
    filters : {
      mandatory : {
        exact : {
          'legacy.programToken' : 4550361
        }
      }
    }
  }).then((result) => {
    console.log('found %d collections', result.total);
  }).catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #allCollectionTracks

This method can be used to retrieve a paginated set of tracks from a collection in the API.

**Usage:** `client.music.allCollectionTracks(collectionId, options, callback)`

* collectionId - _(required)_ - defines the collection for which tracks should be retrieved
* options - _(optional)_ - can be used to supply additional filters and sorting instructions
  * start - the index at which to start selection of items
  * count - the total number of items to retrieve (maximum value is `100`)
  * filters - additional field projections along with mandatory and optional filters (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
  * sort - additional sorting parameters for result (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
* callback - _(optional)_ - a function callback that accepts two arguments
  * err - populated with details in the event of an error
  * result - result set details

```javascript
var collectionId = '<COLLECTION_ID>';

client
  .music
  .allCollectionTracks(collectionId, {
    start : 0,
    count : 100
  }).then((result) => {
    console.log(
      'found %d tracks from collection %s',
      result.total,
      collectionId);
  }).catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #allPlaylists

This method can be used to retrieve a paginated result set of custom playlists from the API. The playlists returned are constrained to those created by the clientId specified in the `#configure` method.

**Usage:** `client.music.allPlaylists(options, callback)`

* options - _(optional)_ - can be used to supply additional filters and sorting instructions
  * start - the index at which to start selection of items
  * count - the total number of items to retrieve (maximum value is `100`)
  * filters - additional field projections along with mandatory and optional filters (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
  * sort - additional sorting parameters for result (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
* callback - _(optional)_ - a function callback that accepts two arguments
  * err - populated with details in the event of an error
  * result - result set details

```javascript
client
  .music
  .allPlaylists({
    start : 0,
    count : 100,
    filters : {
      mandatory : {
        exact : {
          'legacy.playlistToken' : 4550361
        }
      }
    }
  }).then((result) => {
    console.log('found %d playlists', result.total);
  }).catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #allPlaylistTracks

This method can be used to retrieve a paginated set of tracks from a custom playlist in the API.

**Usage:** `client.music.allPlaylistTracks(playlistId, options, callback)`

* playlistId - _(required)_ - defines the playlist for which tracks should be retrieved
* options - _(optional)_ - can be used to supply additional filters and sorting instructions
  * start - the index at which to start selection of items
  * count - the total number of items to retrieve (maximum value is `100`)
  * filters - additional field projections along with mandatory and optional filters (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
  * sort - additional sorting parameters for result (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
* callback - _(optional)_ - a function callback that accepts two arguments
  * err - populated with details in the event of an error
  * result - result set details

```javascript
var playlistId = '<PLAYLIST_ID>';

client
  .music
  .allPlaylistTracks(playlistId, {
    start : 0,
    count : 100
  }).then((result) => {
    console.log(
      'found %d tracks from playlist %s',
      result.total,
      playlistId);
  }).catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #allStations

This method can be used to retrieve a paginated result set of stations from the API.

**Usage:** `client.music.allStations(options, callback)`

* options - _(optional)_ - can be used to supply additional filters and sorting instructions
  * start - the index at which to start selection of items
  * count - the total number of items to retrieve (maximum value is `100`)
  * filters - additional field projections along with mandatory and optional filters (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
  * sort - additional sorting parameters for result (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
* callback - _(optional)_ - a function callback that accepts two arguments
  * err - populated with details in the event of an error
  * result - result set details

```javascript
client
  .music
  .allStations({
    start : 0,
    count : 100,
    filters : {
      mandatory : {
        contains : {
          'title' : 'rock'
        }
      }
    }
  }).then((result) => {
    console.log(
      'found %d "rock" stations',
      result.total);
  }).catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #allStationTracks

This method can be used to retrieve a paginated set of tracks from a station in the API.

**Usage:** `client.music.allStationTracks(stationId, options, callback)`

* stationId - _(required)_ - defines the station for which tracks should be retrieved
* options - _(optional)_ - can be used to supply additional filters and sorting instructions
  * start - the index at which to start selection of items
  * count - the total number of items to retrieve (maximum value is `100`)
  * filters - additional field projections along with mandatory and optional filters (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
  * sort - additional sorting parameters for result (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
* callback - _(optional)_ - a function callback that accepts two arguments
  * err - populated with details in the event of an error
  * result - result set details

```javascript
var stationId = '<STATION_ID>';

client
  .music
  .allStationTracks(stationId, {
    start : 0,
    count : 100
  }).then((result) => {
    console.log(
      'found %d tracks from station %s',
      result.total,
      stationId);
  }).catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #allTracks

This method can be used to retrieve a paginated result set of tracks from the API.

_Note:_ Due to the implementation within the API, some filter parameters are not supported.

**Usage:** `client.music.allTracks(options, callback)`

* options - _(optional)_ - can be used to supply additional filters and sorting instructions
  * start - the index at which to start selection of items
  * count - the total number of items to retrieve (maximum value is `100`)
* callback - _(optional)_ - a function callback that accepts two arguments
  * err - populated with details in the event of an error
  * result - result set details

```javascript
client
  .music
  .allTracks({
    start : 0,
    count : 100
  }).then((result) => {
    console.log(
      'found %d tracks',
      result.total);
  }).catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #checkPlaylistTrack

This method can be used to verify if a track exists within a station. Because a track can be added to a custom playlist multiple times, this method may be handy for understanding whether track is already within the custom playlist prior to adding it again.

**Usage:** `client.music.checkPlaylistTrack(playlistId, trackAlias, callback)`

* playlistId - _(required)_ - defines the playlist
* trackAlias - _(required)_ - defines the track to verify
* callback - _(optional)_ - a function callback that accepts two arguments
  * err - populated with details in the event of an error
  * exists - a boolean (`true` or `false`) representing whether the track exists within the requested playlist

```javascript
var
  playlistId = '<PLAYLIST_ID>',
  trackAlias = ['tracktoken', 12345].join(':');

client
  .music
  .checkPlaylistTrack(playlistId, trackAlias).then((exists) => {
    if (exists) {
      console.log(
        'track %s exists in playlist %s',
        trackAlias,
        playlistId);
    } else {
      console.log(
        'track %s does not exist in playlist %s',
        trackAlias,
        playlistId);
    }
  }).catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #createBroadcast

[back to top](#usage)

#### #createPlaylist

[back to top](#usage)

#### #deleteBroadcast

[back to top](#usage)

#### #deletePlaylist

[back to top](#usage)

#### #deletePlaylistTrack

[back to top](#usage)

#### #getBroadcast

[back to top](#usage)

#### #getCollection

[back to top](#usage)

#### #getPlaylist

[back to top](#usage)

#### #getStation

[back to top](#usage)

#### #getTracks

[back to top](#usage)

#### #getTrack

[back to top](#usage)

#### #mixCollection

[back to top](#usage)

#### #updatePlaylist

[back to top](#usage)
