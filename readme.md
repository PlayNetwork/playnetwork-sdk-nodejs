# PlayNetwork Node.js SDK

[![Build Status](https://travis-ci.org/PlayNetwork/playnetwork-sdk-nodejs.svg?branch=develop)](https://travis-ci.org/PlayNetwork/playnetwork-sdk-nodejs) [![Coverage Status](https://coveralls.io/repos/github/PlayNetwork/playnetwork-sdk-nodejs/badge.svg)](https://coveralls.io/github/PlayNetwork/playnetwork-sdk-nodejs)

This module is an open source project with the goal of making the task of consuming various PlayNetwork APIs easy and straight-forward.

## Install

```bash
npm install playnetwork-sdk
```

## Usage

### Getting Started

* [constructor](#constructor)
* [options](#options)
* [CLI](#cli)

- - -

### Music

This module can be used to interact with the [CURIOMusic API](https://curio-music-api.apps.playnetwork.com/v2/docs) to retrieve content programming and track meta-data.

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

- - -

### Content

This module can be used to interact with the [PlayNetwork Content API](https://content-api.apps.playnetwork.com/v0/docs) to retrieve tracks, verify existence of tracks to acknowledge download.

* [checkAsset](#checkasset)
* [checkLegacyAsset](#checklegacyasset)
* [getAssetStream](#getassetstream)
* [getLegacyAssetStream](#getlegacyassetstream)

- - -

### Playback

This module can be used to interact with the [Playback API](https://playback-api.apps.playnetwork.com/v1/docs) to get NowPlaying information, play history and record playback.

* [allPlays](#allplays)
* [recordPlay](#recordplay)

- - -

### Playerservice

This module can be used to interact with Playnetwork's socket-io service, https://player-svc.apps.playnetwork.com, to allow realtime communication to/from a device for the purposes of gathering information about that device and controling music playback

* [connect](#connect)
* [disconnect](#disconnect)
* [emit](#emit)


- - -

### Provision

This module can be used to interact with the [Playback API](https://provision-api.apps.playnetwork.com/v1/docs) to get activation information such as clientId/sharedSecret and a list of apps needed for installation or update. 

* [getApplicationsStream](#getApplicationsStream)
* [getClientCredentialsStream](#getClientCredentialsStream)

- - -

### Settings

This module provides support for retrieving location / device specific environment settings, including network details, proxy configuration, throttling and more.

* [allSettings](#allsettings)
* [getSettings](#getsettings)

- - -

### Location

This module allows one to retrieve information for locations as PlayNetwork understands them.

* [allAccountLocations](#allaccountlocations)
* [allLocations](#alllocations)
* [allPhysicalLocations](#allphysicallocations)
* [deletePhysicalLocation](#deletephysicallocation)
* [getLocation](#getlocation)
* [getLocations](#getlocations)

- - -

### Device

This module enables simple access to device group and individual device status information.

* [allDevices](#alldevices)
* [allGroups](#allgroups)
* [createDiagnostics](#creatediagnostics)
* [createEventMessages](#createventmessages)
* [createStatusReport](#createstatusreport)
* [getAnalytics](#getanalytics)
* [getDevice](#getdevice)
* [getDevices](#getDevices)
* [getGroup](#getgroup)
* [getGroupAnalytics](#getgroupanalytics)
* [getGroupDevices](#getgroupdevices)
* [getGroups](#getgroups)
* [getGroupsAnalytics](#getgroupsanalytics)

- - -

### Getting Started

#### Constructor

The PlayNetwork SDK must be configured with a valid and active `clientId` and `secret` prior to use. If `#configure` is not called, no functionality within the SDK is enabled and all SDK sub-modules (i.e. `music`, `settings`, `content`, etc.) will be `undefined`.

```javascript
var playnetwork = require('playnetwork-sdk');

playnetwork.configure(
  '<CLIENT_ID>',
  '<CLIENT_SECRET>');

// echo configured settings
console.log(playnetwork.options());
```

##### Shared Credentials File

Alternatively, the PlayNetwork SDK may be configured with a `clientId` and `secret` using a shared credentials file.

By default, the SDK will search for the shared credentials file within `process.env.HOME` (or `process.env.USERPROFILE` when using Windows) at the following path: `.playnetwork/credentials.json` (i.e. `/home/ubuntu/.playnetwork/credentials.json`, etc.). A credentials file path can alternatively be specified via options when calling `#configure`.

When using the shared credentials file, the file must be in the following JSON format:

```json
{
  "clientId": "<CLIENT_ID>",
  "secret": "<SECRET>"
}
```

Example `#configure` usage for loading the clientId and secret from the default credentials path:

```javascript
var playnetwork = require('playnetwork-sdk');

playnetwork.configure();
```

Example `#configure` usage for loading the clientId and secret from a specified file path:

```javascript
var playnetwork = require('playnetwork-sdk');

playnetwork.configure({
  key {
    credentialsPath : '/path/to/credentials.json'
  }
});
```

[back to top](#usage)

#### Options

The PlayNetwork SDK allows for a set of additional configuration parameters to be specified as an optional argument to the `#configure` method. This parameter is fully optional and, by default, all communication occurs with the PlayNetwork production environment.

The supported options are as follows:

* `content`
  * `host` - the hostname of the content API
  * `secure` - defaults to `true`, defines when the API uses TLS
* `key`
  * `host` - the hostname of the key API
  * `secure` - defaults to `true`, defines when the API uses TLS
  * `cacheTokens`
* `music`
  * `host` - the hostname of the music API
  * `secure` - defaults to `true`, defines when the API uses TLS
* `playback`
  * `host` - the hostname of the playback API
  * `secure` - defaults to `true`, defines when the API uses TLS
* `player`
  * `host` - the hostname of the playerservice app
  * `secure` - defaults to `true`, defines when the API uses TLS
* `provision`
  * `host` - the hostname of the provision API
  * `secure` - defaults to `true`, defines when the API uses TLS
* `settings`
  * `host` - the hostname
  * `secure` -

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
    },
    player : {
      host : 'https://player-svc.apps.playnetwork.com'
    },
    provision : {
      host : 'sandbox-provision-api.apps.playnetwork.com'
    },
    settings : {
      host : 'sandbox-settings-api.apps.playnetwork.com'
    }
  };

playnetwork.configure(
  '<CLIENT_ID>',
  '<CLIENT_SECRET>',
  options);

// echo configured settings
console.log(playnetwork.options());
```

[back to top](#usage)

#### CLI

In order to use the CLI, a [Shared Credentials File](#shared-credentials-file) must configured first. Additionally, the module should be installed globally:

```bash
npm install -g playnetwork-sdk
```

##### Usage

```bash
usage: playnetwork [-s] [-a | --api] [-c | --command] [-? | -h | --help]
    -s                   - specify pipe mode for input stream
    -a <api>             - the API to use
    -c <command> <args>  - the command and arguments to supply
    -h                   - help
    -v                   - verbose
```

* `-a` (or `--api`): supply any sub-module of the SDK (i.e. `music`, `content`, `playback`, etc.)
* `-c` (or `--command`): supply any method for the specified sub-module (i.e. `allStations`, etc.)
* `-s`: required when supplying additional data (in JSON format) via a pipe
* `-v`: will display the outbound request and inbound response details for the call to the API

##### Examples

*Get all stations:*

```bash
playnetwork -a music -c allStations
```

*Get stations with options (notice the use of `-s` in the command below):*

```bash
echo '{ "count" : 1, "sort" : { "desc" : "modified" } }' | playnetwork -s -a music -c allStations
```

*Delete a broadcast with verbose output (notice the use of `-v` in the command below):*

```bash
playnetwork -v -a music -c deleteBroadcast <stationId> <broadcastId>
```

*Download a legacy asset file:*

```bash
playnetwork -a content -c getLegacyAssetStream <legacy.trackToken> > ~/Downloads/file.mp2
```

[back to top](#usage)

- - -

### Music Module

The music module is designed to simplify interaction with the [PlayNetwork CURIOMusic API](https://curio-music-api.apps.playnetwork.com/v2/docs). This module supports the following methods:

#### #addPlaylistTracks

This method can be used to add tracks to an existing custom playlist.

**Usage:** `client.music.addPlaylistTracks(playlistId, tracks, callback)`

* `playlistId` - _(required)_ - defines the playlist to which tracks should be added
* `tracks` - _(required)_ - an array of track objects to add to the playlist
  * _NOTE:_ assetId or legacy.trackToken must be supplied
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `result` - result set details

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

* `stationId` - _(required)_ - defines the station for which broadcasts should be retrieved
* `options` - _(optional)_ - can be used to supply additional filters and sorting instructions
  * `start` - the index at which to start selection of items
  * `count` - the total number of items to retrieve (maximum value is `100`)
  * `filters` - additional field projections along with mandatory and optional filters (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
  * `sort` - additional sorting parameters for result (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `result` - result set details

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

* `options` - _(optional)_ - can be used to supply additional filters and sorting instructions
  * `start` - the index at which to start selection of items
  * `count` - the total number of items to retrieve (maximum value is `100`)
  * `filters` - additional field projections along with mandatory and optional filters (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
  * `sort` - additional sorting parameters for result (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `result` - result set details

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

* `collectionId` - _(required)_ - defines the collection for which tracks should be retrieved
* `options` - _(optional)_ - can be used to supply additional filters and sorting instructions
  * `start` - the index at which to start selection of items
  * `count` - the total number of items to retrieve (maximum value is `100`)
  * `filters` - additional field projections along with mandatory and optional filters (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
  * `sort` - additional sorting parameters for result (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `result` - result set details

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

* `options` - _(optional)_ - can be used to supply additional filters and sorting instructions
  * `start` - the index at which to start selection of items
  * `count` - the total number of items to retrieve (maximum value is `100`)
  * `filters` - additional field projections along with mandatory and optional filters (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
  * `sort` - additional sorting parameters for result (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `result` - result set details

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

* `playlistId` - _(required)_ - defines the playlist for which tracks should be retrieved
* `options` - _(optional)_ - can be used to supply additional filters and sorting instructions
  * `start` - the index at which to start selection of items
  * `count` - the total number of items to retrieve (maximum value is `100`)
  * `filters` - additional field projections along with mandatory and optional filters (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
  * `sort` - additional sorting parameters for result (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `result` - result set details

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

* `options` - _(optional)_ - can be used to supply additional filters and sorting instructions
  * `start` - the index at which to start selection of items
  * `count` - the total number of items to retrieve (maximum value is `100`)
  * `filters` - additional field projections along with mandatory and optional filters (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
  * `sort` - additional sorting parameters for result (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `result` - result set details

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

* `stationId` - _(required)_ - defines the station for which tracks should be retrieved
* `options` - _(optional)_ - can be used to supply additional filters and sorting instructions
  * `start` - the index at which to start selection of items
  * `count` - the total number of items to retrieve (maximum value is `100`)
  * `filters` - additional field projections along with mandatory and optional filters (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
  * `sort` - additional sorting parameters for result (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `result` - result set details

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

* `options` - _(optional)_ - can be used to supply additional filters and sorting instructions
  * `start` - the index at which to start selection of items
  * `count` - the total number of items to retrieve (maximum value is `100`)
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `result` - result set details

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

* `playlistId` - _(required)_ - defines the playlist
* `trackAlias` - _(required)_ - defines the track to verify
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
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

This method can be used to create a new broadcast for an existing station.

**Usage:** `client.music.createBroadcast(stationId, options, callback)`

* `stationId` - _(required)_ - defines the station for which the broadcast should be created
* `options` - _(optional)_ - defines additional parameters for the broadcast
  * `beginDate` - _(optional)_ - the date and time at which the broadcast schedule should begin (defaults to the current date and time if not supplied)
  * `duration` - _(optional)_ - the length, in minutes, for the playlist (defaults to 1440 which is 24 hours)
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `result` - the response from the API

```javascript
var stationId = '<STATION_ID>';

client
  .music
  .createBroadcast(stationId)
  .then((broadcast) => {
    console.log(
      'successfully created broadcast with id %s',
      broadcast.broadcastId);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #createPlaylist

This method can be used to create a new custom playlist.

**Usage:** `client.music.createPlaylist(playlist, callback)`

* `playlist` - _(required)_ - defines the details of the playlist
  * `title` - _(required)_ - the name of the custom playlist
  * `tracks` - _(optional)_ - the tracks that should be added to the playlist at the time it is created
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `result` - the response from the API

```javascript
var info = {
  title : 'Vorster\'s Favorite Hits'
};

client
  .music
  .createPlaylist(info)
  .then((playlist) => {
    console.log(
      'successfully created playlist with id %s',
      playlist.playlistId);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #deleteBroadcast

This method can be used to delete an existing broadcast schedule from within a station.

**Usage:** `client.music.deleteBroadcast(stationId, broadcastId, callback)`

* `stationId` - _(required)_ - defines the station within which the broadcast exists
* `broadcastId` - _(required)_ - defines the broadcast to delete
* `callback` - _(optional)_ - a function callback that accepts a single argument
  * `err` - populated with details in the event of an error

```javascript
var
  stationId = '<STATION_ID>',
  broadcastId = '<BROADCAST_ID>';

client
  .music
  .deleteBroadcast(stationId, broadcastId)
  .then((playlist) => {
    console.log(
      'successfully deleted broadcast with id %s',
      broadcastId);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #deletePlaylist

This method can be used to delete an existing custom playlist.

**Usage:** `client.music.deletePlaylist(playlistId, callback)`

* `playlistId` - _(required)_ - defines the playlist to delete
* `callback` - _(optional)_ - a function callback that accepts a single argument
  * `err` - populated with details in the event of an error

```javascript
var playlistId = '<PLAYLIST_ID>';

client
  .music
  .deletePlaylist(playlistId)
  .then((playlist) => {
    console.log(
      'successfully deleted playlist with id %s',
      playlistId);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #deletePlaylistTrack

This method can be used to remove an existing track from a custom playlist.

**Usage:** `client.music.deletePlaylistTrack(playlistId, trackAlias, callback)`

* `playlistId` - _(required)_ - defines the playlist from which the track should be removed
* `trackAlias` - _(required)_ - defines the track to remove
* `callback` - _(optional)_ - a function callback that accepts a single argument
  * `err` - populated with details in the event of an error

```javascript
var
  playlistId = '<PLAYLIST_ID>',
  trackAlias = 'tracktoken:1234';

client
  .music
  .deletePlaylistTrack(playlistId, trackAlias)
  .then((playlist) => {
    console.log(
      'successfully deleted track %s from playlist with id %s',
      trackAlias,
      playlistId);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #getBroadcast

To retrieve a specific broadcast for a station, by broadcast identifier, use this method.

**Usage:** `client.music.getBroadcast(stationId, broadcastId, callback)`

* `stationId` - _(required)_ - defines the station from which the broadcast should be retrieved
* `broadcastId` - _(required)_ - defines the broadcast to retrieve
* `callback` - _(optional)_ - a function callback that accepts a single argument
  * `err` - populated with details in the event of an error
  * `broadcast` - the broadcast

```javascript
var
  stationId = '<STATION_ID>',
  broadcastId = '<BROADCAST_ID>';

client
  .music
  .getBroadcast(stationId, broadcastId)
  .then((broadcast) => {
    console.log(
      'successfully retrieved broadcast %s',
      broadcast.broadcastId);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #getCollection

To retrieve a specific collection by collection identifier, use this method.

**Usage:** `client.music.getCollection(collectionId, callback)`

* `collectionId` - _(required)_ - defines the collection that should be retrieved
* `callback` - _(optional)_ - a function callback that accepts a single argument
  * `err` - populated with details in the event of an error
  * `collection` - the collection

```javascript
var collectionId = '<COLLECTION_ID>';

client
  .music
  .getCollection(collectionId)
  .then((collection) => {
    console.log(
      'successfully retrieved collection %s',
      collection.collectionId);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #getPlaylist

To retrieve a specific custom playlist by identifier, use this method.

**Usage:** `client.music.getPlaylist(playlistId, callback)`

* `playlistId` - _(required)_ - defines the custom playlist that should be retrieved
* `callback` - _(optional)_ - a function callback that accepts a single argument
  * `err` - populated with details in the event of an error
  * `playlist` - the playlist

```javascript
var playlistId = '<PLAYLIST_ID>';

client
  .music
  .getPlaylist(playlistId)
  .then((customPlaylist) => {
    console.log(
      'successfully retrieved custom playlist %s',
      customPlaylist.collectionId);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #getStation

This method provides the ability to retrieve a station by identifier.

**Usage:** `client.music.getStation(stationId, callback)`

* `stationId` - _(required)_ - defines the station that should be retrieved
* `callback` - _(optional)_ - a function callback that accepts a single argument
  * `err` - populated with details in the event of an error
  * `station` - the station

```javascript
var stationId = '<STATION_ID>';

client
  .music
  .getStation(stationId)
  .then((station) => {
    console.log(
      'successfully retrieved station %s',
      station.stationId);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #getTrack

This method provides the ability to retrieve a single track by identifier.

**Usage:** `client.music.getTrack(alias, callback)`

* `alias` - _(required)_ - defines the track that should be retrieved
  * can be the `assetId` for the track
  * can be `trackToken:12345` where the `12345` refers to a `legacy.trackToken` value for a track
  * can be the spotify URI (i.e. `spotify:track:1Ynbmv088`)
* `callback` - _(optional)_ - a function callback that accepts a single argument
  * `err` - populated with details in the event of an error
  * `track` - the track

```javascript
var trackAlias = '<ALIAS>';

client
  .music
  .getTrack(trackAlias)
  .then((track) => {
    console.log(
      'successfully retrieved track %s',
      track.assetId);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #getTracks

This method allows for the lookup of multiple tracks by a specific alias. This specific functionality comes in handy when attempting to perform a bulk lookup against the CURIOMusic API.

**Usage:** `client.music.getTracks(aliasList, callback)`

* `aliasList` - _(required)_ - defines an array of tracks that should be retrieved
  * can be the `assetId` for the track
  * can be `trackToken:12345` where the `12345` refers to a `legacy.trackToken` value for a track
  * can be the spotify URI (i.e. `spotify:track:1Ynbmv088`)
* `callback` - _(optional)_ - a function callback that accepts a single argument
  * `err` - populated with details in the event of an error
  * `tracks` - an array of tracks found

```javascript
var trackAliasList = [
  '<ALIAS_1>',
  '<ALIAS_2>'
];

client
  .music
  .getTracks(trackAliasList)
  .then((tracks) => {
    console.log(
      'successfully retrieved %d tracks',
      tracks.length);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #mixCollection

This method allows for the lookup of multiple tracks by a specific alias. This specific functionality comes in handy when attempting to perform a bulk lookup against the CURIOMusic API.

**Usage:** `client.music.getTracks(aliasList, callback)`

* `collection` - _(required)_ - defines the collection from which the mix should be created
* `options` - _(optional)_ - defines the characteristics of the mix
  * `artistSeparation` - _(optional)_ - the number of songs to play before repeating an artist (defaults to 5)
  * `beginDate` - _(optional)_ - the date and time of when to start the mix (defaults to the current date and time)
  * `duration` - _(optional)_ - the length, in minutes, that the mix should be generated for (defaults to 1440 which is 24 hours)
  * `randomMix` - _(optional)_ - can be `true` or `false` - when true, tracks are pulled randomly from within the collection (defaults to true)
  * `titleSeparation` - _(optional)_ - the number of songs to play before repeating a title (defaults to 5)
* `callback` - _(optional)_ - a function callback that accepts a single argument
  * `err` - populated with details in the event of an error
  * `mix` - the mixed queue of tracks from the collection
    * `options` - details regarding how the mix was created
    * `queue` - the mixed list of tracks from the collection

```javascript
var collectionId = '<COLLECTION_ID>';

client
  .music
  .mixCollection(collectionId)
  .then((mix) => {
    console.log(
      'successfully created mix with %d tracks',
      mix.queue.length);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #updatePlaylist

This method can be used to update an existing custom playlist.

**Usage:** `client.music.updatePlaylist(playlist, callback)`

* `playlist` - _(required)_ - defines the details of the playlist
  * `playlistId` - _(required)_ - the identifier of the playlist
  * `title` - _(optional)_ - the name of the custom playlist
  * `tracks` - _(optional)_ - the tracks that should be added to the playlist at the time it is created
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `playlist` - the response from the API

```javascript
var playlist = {
  playlistId : '<PLAYLIST_ID',
  title : 'Vorster\'s Favorite Hits (redux)'
};

client
  .music
  .updatePlaylist(playlist)
  .then((playlist) => {
    console.log(
      'successfully updated playlist with id %s',
      playlist.playlistId);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

- - -

### Content Module

This module can be used to interact with the [PlayNetwork Content API](https://content-api.apps.playnetwork.com/v0/docs) to retrieve tracks, verify existence of tracks to acknowledge download.

#### #checkAsset

This method can be used to determine if a particular asset exists on the server.

**Usage:** `client.content.checkAsset(track, options, callback)`

* `track` - _(required)_ - defines the asset to retrieve
* `options` - _(optional)_ - additional parameters useful for identifying the characteristics specific to the asset
  * `bitrate` - _(optional)_ -
  * `channels` - _(optional)_ -
  * `format` - _(optional)_ -
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `result` - result set details

```javascript
var
  track = {
    assetId : '<ASSET_ID>'
  },
  options = {
    bitrate : 192000,
    channels : 2,
    format : 'ogg'
  };

client
  .content
  .checkAsset(track, options)
  .then((exists) => {
    if (exists) {
      console.log('asset %s exists as requested', track.assetId);
    } else {
      console.error('asset %s does not exist!', track.assetId);
    }
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #checkLegacyAsset

This method can be used to determine if a particular asset exists on the server.

**Usage:** `client.content.checkLegacyAsset(track, options, callback)`

* `track` - _(required)_ - defines the asset to retrieve
* `options` - _(optional)_ - additional parameters useful for identifying the characteristics specific to the asset
  * `bitrate` - _(optional)_ -
  * `channels` - _(optional)_ -
  * `format` - _(optional)_ -
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `result` - result set details

```javascript
var track = {
  legacy : {
    trackToken : 12345
  }
};

client
  .content
  .checkLegacyAsset(track)
  .then((exists) => {
    if (exists) {
      console.log('asset %s exists as requested', track.legacy.trackToken);
    } else {
      console.error('asset %s does not exist!', track.legacy.trackToken);
    }
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #getAssetStream

This method is useful for retrieving a stream of bytes for a specific asset.

**Usage:** `client.content.getAssetStream(track, options, callback)`

* `track` - _(required)_ - defines the asset to retrieve
* `options` - _(optional)_ - additional parameters useful for identifying the characteristics specific to the asset
  * `bitrate` - _(optional)_ -
  * `channels` - _(optional)_ -
  * `format` - _(optional)_ -
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `result` - result set details

```javascript
var track = {
  assetId : '<ASSET_ID>'
};

client
  .content
  .getAssetStream(track)
  .then((audio) => {
    let size = 0;

    audio.on('data', (chunk) => {
      size += chunk.length;
    });

    audio.on('end', () => {
      console.log('completed retrieval of %d bytes', size);
    });
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #getLegacyAssetStream

This method is useful for retrieving a legacy asset stream of bytes for a specific asset.

**Usage:** `client.content.getLegacyAssetStream(track, options, callback)`

* `track` - _(required)_ - defines the asset to retrieve
* `options` - _(optional)_ - additional parameters useful for identifying the characteristics specific to the asset
  * `bitrate` - _(optional)_ -
  * `channels` - _(optional)_ -
  * `format` - _(optional)_ -
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `result` - result set details

```javascript
var track = {
  legacy : {
    trackToken : 12345
  }
};

client
  .content
  .getLegacyAssetStream(track)
  .then((audio) => {
    let size = 0;

    audio.on('data', (chunk) => {
      size += chunk.length;
    });

    audio.on('end', () => {
      console.log('completed retrieval of %d bytes', size);
    });
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

- - -

### Playback Module

The playback module is designed to simplify interaction with the [PlayNetwork Playback API](https://playback-api.apps.playnetwork.com/v1/docs). This module supports the following methods:

#### #allPlays

This method can be used to retrieve a paginated result set of plays from the API. By default, only one play (the most recent one) is returned, but eh `count` parameter can be supplied via `options` to retrieve more data. Only a limited amount of time is retained for playback history and, as a result, not all plays throughout the history of the device will be available.

**Usage:** `client.playback.allPlays(key, options, callback)`

* `key` - _(required)_ - defines a composite key for retrieving play history for a device (i.e. `deviceId:aabbcc112233`)
* `options` - _(optional)_ - can be used to supply additional filters and sorting instructions
  * `start` - the index at which to start selection of plays
  * `count` - the total number of plays to retrieve (maximum value is `100`)
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `result` - result set details

```javascript
client
  .playback
  .allPlays({
    start : 0,
    count : 10
  }).then((result) => {
    console.log(
      'found %d plays',
      result.total);
  }).catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #recordPlay

This method can be used to record playback for a specific device or location.

**Usage:** `client.playback.recordPlay(playbackInfo, callback)`

* `playbackInfo` - _(required)_ - defines the playback info that should be recorded
  * `client` - _(optional)_ - defines additional information about the device upon which the play occurred
    * `host` - host details for the playback
      * `deviceId` - the identifier for the host playing the content
    * `software` - software details for the playback
  * `content`
    * `assetId` or `legacy.trackToken` - _(required)_ - the content being played
  * `created` - _(optional)_ - the time at which the play began - this is defaulted to the current date and time if omitted
  * `deviceId` or `legacy.deviceToken` - _(required)_ - the device upon which content is being played
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `result` - result set details

```javascript
var play = {
  client : {
    host : {
      deviceId : 'aa:bb:cc:11:22:33'
    },
    software : {
      platform : 'Linux',
      type : 'NodePlayer',
      version : 'v1.0.0'
    }
  },
  content : {
    legacy : {
      trackToken : 12345
    }
  }
};

client
  .playback
  .recordPlay(play)
  .then((result) => {
    console.log('successfully recorded play with id %s', result.playId);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

- - -

### Playerservice Module

This module can be used to interact with Playnetwork's socket-io service, https://player-svc.apps.playnetwork.com, to allow realtime communication to/from a device for the purposes of gathering information about that device and controling music playback. This module supports the following methods:

#### #connect

This method is used to connect to Playnetwork's socket-io service.

**Usage:** `client.player.connect(socketEventSubscriber)`

* `socketEventSubscriber` - _(required)_ - defines an event subsciber. The subscriber should implement the events covered in the Events section discussed below.

```javascript
client
  .player
  .connect(socketEventSubscriber);
```

[back to top](#usage)

#### #disconnect

This method is used to disconnect from Playnetwork's socket-io service. 

**Usage:** `client.player.disconnect`

Fires disconnected event if successful
If not successful, will fire error event

```javascript
client
  .player
  .disconnect();
```

[back to top](#usage)

#### #emit

This method is to emit a message to Playnetwork's socket-io service.

**Usage:** `client.player.emit(event, jsonRpcMessage)`
Params:
event (an event string defined by Playnetwork's socket-io service)
jsonRpcMessage (json RPC formatted message)

```javascript
client
  .player
  .emit('playerUp', { mac: 'b8:e8:56:37:4c:6a' });
```

#### #Events

* Event: 'connected', fired when a successful initial connection or reconnection is made to the socket-io service
  Params: connection object
```javascript
      { 
        "connectionAttempt" : number indicating the connection attempts (0 for initial, n for reconnect)
        "isReconnect" : true | false,    (true if this is a reconnection, false otherwise)
        "url" : url (String, the url that the method connected to)
      }
```       

* Event: 'disconnected'
  Fired when client disconnects from the socket-io service
  
* Event: 'error'
  Fired when an error occurs
  Params: error object
  
* Event: 'message'
  Fired when client recieves a json rpc formatted message from Playnetwork's socket-io service

* Event: 'reconnecting', fired when reconnecting to the player-svc
  Params: connection object
```javascript  
    {
      "connectionAttempt" : attempt,   (attempt number)
      "url" : url    (url attempting to connect to)
    };
``` 

[back to top](#usage)

- - -

### Provision Module

The provision module is designed to simplify interaction with the [PlayNetwork Playback API](https://provision-api.apps.playnetwork.com/v1/docs). This module supports the following methods:

#### #getClientCredentialsStream

This method can be used to retrieve a stream that when read will contain a client ID and shared secret that the device can use to interact with Playnetwork APIs. The provision module will use a default credential set initially if there are no actual credentials defined. 

**Usage:** `client.provision.getClientCredentialsStream(deviceId, options)`

* `deviceId` - _(required)_ - defines the device identifier, in most cases, the mac address of the device
* `options` - _(optional)_ - can be used to supply authorization headers such as clientId/secret i.e. can override defaults

```javascript
client
  .provision
  .getClientCredentialsStream({
					'x-client-id': 'test',
					'x-authentication-token': 'test'
				})
  .then((credentialsStream) => {
    // read credentials stream
  }).catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #getApplicationsStream

This method can be used to retrieve a stream that when read will contain a yml files that can be consumed by docker compose

**Usage:** `client.provision.getApplicationsStream(options)`

* `options` - _(optional)_ - can be used to supply authorization headers such as clientId/secret i.e. can override defaults

```javascript
client
  .provision
  .getApplicationsStream({
					'x-client-id': 'test',
					'x-authentication-token': 'test'
				})
  .then((applicaitonsYmlStream) => {
    // read applications stream
  }).catch((err) => {
    console.error(err);
  });
```
 
[back to top](#usage)

- - -

### Settings Module

The settings module is designed to simplify interaction with the [PlayNetwork Settings API](https://curio-settings-api.apps.playnetwork.com/v0/docs). This module supports the following methods:

#### #allSettings

This method differs slightly from all other methods with a similar name. Specifically, this method will return the settings that are assigned directly to the `clientId` used to instantiate this SDK.

**Usage:** `client.settings.allSettings(options, callback)`

* `options` - _(optional)_ - can be used to supply additional filters and sorting instructions
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `settings` - the settings

```javascript
client
  .settings
  .allSettings()
  .then((settings) => {
    console.log(
      'found settings with settingsId %s',
      settings.settingsId);
  }).catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #getSettings

In order to retrieve settings for a specific device or location, this method can be used.

**Usage:** `client.settings.getSettings(options, callback)`

* `alias` - _(required)_ - defines the specific settings to retrieve
  * can be the `settingsId` that defines a specific result
  * can be defined as `deviceToken:12345` where `12345` is the `legacy.deviceToken` of the target settings
* `options` - _(optional)_ - can be used to supply additional filters and sorting instructions
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `settings` - the settings

```javascript
client
  .settings
  .getSettings('deviceToken:12345')
  .then((settings) => {
    console.log(
      'found settings for device 12345 and the settingsId is %s',
      settings.settingsId);
  }).catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

### Location Module

The location module is designed to simplify interaction with the PlayNetwork Location API. This module supports the following methods:

#### #allAccountLocations

This method can be used to retrieve a list of accounts aggregated locations from the API.

**Usage:** `client.location.allAccountLocations(options, callback)`

* `options` - _(optional)_ - can be used to supply additional filters and sorting instructions
  * `start` - the index at which to start selection of items
  * `count` - the total number of items to retrieve (maximum value is `100`)
  * `filters` - additional field projections along with mandatory and optional filters (see [API documentation](https://location-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
  * `sort` - additional sorting parameters for result (see [API documentation](https://location-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `result` - result set details

```javascript
client
  .location
  .allAccountLocations({
    count : 100,
    start : 0
  })
  .then((result) => {
    console.log('successfully found %d accounts', result.total);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #allLocations

This method can be used to retrieve a list of locations from the API.

**Usage:** `client.location.allLocations(options, callback)`

* `options` - _(optional)_ - can be used to supply additional filters and sorting instructions
  * `start` - the index at which to start selection of items
  * `count` - the total number of items to retrieve (maximum value is `100`)
  * `filters` - additional field projections along with mandatory and optional filters (see [API documentation](https://location-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
  * `sort` - additional sorting parameters for result (see [API documentation](https://location-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `result` - result set details

```javascript
client
  .location
  .allLocations({
    count : 100,
    start : 0
  })
  .then((result) => {
    console.log('successfully found %d locations', result.total);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #allPhysicalLocations

This method can be used to retrieve a list of physical locations from the API.

**Usage:** `client.location.allPhysicalLocations(options, callback)`

* `options` - _(optional)_ - can be used to supply additional filters and sorting instructions
  * `start` - the index at which to start selection of items
  * `count` - the total number of items to retrieve (maximum value is `100`)
  * `filters` - additional field projections along with mandatory and optional filters (see [API documentation](https://location-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
  * `sort` - additional sorting parameters for result (see [API documentation](https://location-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `result` - result set details

```javascript
client
  .location
  .allPhysicalLocations({
    count : 100,
    start : 0
  })
  .then((result) => {
    console.log('successfully found %d physical locations', result.total);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #deletePhysicalLocation

This method can be used to delete a physicalLocation by physicalLocationId.

**Usage:** `client.location.deletePhysicalLocation(physicalLocationId, callback)`

* `physicalLocationId` - _(required)_ - defined the physicalLocation that should be deleted
* `callback` - _(optional)_ - a function callback that accepts a single argument
  * `err` - populated with details in the event of an error
  * `physicalLocation` - the physicalLocation

```javascript
var physicalLocationId = '<PHYSICAL_LOCATION_ID>';

client
  .location
  .deletePhysicalLocation(physicalLocationId)
  .then(() => {
    console.log(
      'successfully deleted physicalLocationId %s',
      physicalLocationId);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #getLocation

To retrieve details for a particular location, use this method.

**Usage:** `client.location.getLocation(locationId, options, callback)`

* `locationId` - _(required)_ - defines the location that should be retrieved
* `options` - _(optional)_ - additional options
* `callback` - _(optional)_ - a function callback that accepts a single argument
  * `err` - populated with details in the event of an error
  * `location` - the location

```javascript
var locationId = '<LOCATION_ID>';

client
  .location
  .getLocation(locationId)
  .then((location) => {
    console.log(
      'successfully retrieved location %s',
      location.locationId);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### getLocations

Works similarly to [getLocation](#getlocation), but allows for multiple locations to be provided as a bulk request.

**Usage:** `client.location.getLocations(locationIdList, callback)`

* `locationIdList` - _(required)_ - an array of locationId values to lookup
* `callback` - _(optional)_ - a function callback that accepts a single argument
  * `err` - populated with details in the event of an error
  * `locations` - the locations

```javascript
var deviceIdList = ['<LOCATION_ID_1>', '<LOCATION_ID_2>', '<LOCATION_ID_3>'];

client
  .location
  .getLocations(locationIdList)
  .then((locations) => {
    console.log(
      'successfully retrieved %d locations',
      locations.length);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

### Device Module

The device module is designed to simplify interaction with the PlayNetwork Device API. This module supports the following methods:

#### #allDevices

This method can be used to retrieve a list of devices from the API.

**Usage:** `client.device.allDevices(options, callback)`

* `options` - _(optional)_ - can be used to supply additional filters and sorting instructions
  * `start` - the index at which to start selection of items
  * `count` - the total number of items to retrieve (maximum value is `100`)
  * `filters` - additional field projections along with mandatory and optional filters (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
  * `sort` - additional sorting parameters for result (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `result` - result set details

```javascript
client
  .device
  .allDevices({
    count : 100,
    start : 0
  })
  .then((result) => {
    console.log('successfully found %d devices', result.total);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #allGroups

This method can be used to retrieve a list of groups from the API.

**Usage:** `client.device.allGroups(options, callback)`

* `options` - _(optional)_ - can be used to supply additional filters and sorting instructions
  * `start` - the index at which to start selection of items
  * `count` - the total number of items to retrieve (maximum value is `100`)
  * `filters` - additional field projections along with mandatory and optional filters (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
  * `sort` - additional sorting parameters for result (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `result` - result set details

```javascript
client
  .device
  .allGroups({
    count : 100,
    start : 0
  })
  .then((result) => {
    console.log('successfully found %d device groups', result.total);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #createDiagnostics

This method can be used to update the API with specific details regarding the status of the device.

**Usage:** `client.device.createDiagnostics(deviceId, diagnostics, callback)`

* `deviceId` - _(required)_ - should contain the identifier of the device
* `diagnostics` - _(required)_ - an object with details regarding the status and settings of the device
  * `TBD` - details regarding this message required
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `result` - result set details

```javascript
let
  deviceId = '<DEVICE_ID>',
  diagnostics = {
    // requires definition
  };

client
  .device
  .createDiagnostics(deviceId, diagnostics)
  .then(() => {
    console.log('diagnostics sent!');
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #createEventMessages

When needing to notify the API of one or more event message for a device, this method should be used.

**Usage:** `client.device.createEventMessages(deviceId, messages, callback)`

* `deviceId` - _(required)_ - should contain the identifier of the device
* `messages` - _(required)_ - may be a `string` message, a single message `object` or an array of message strings or objects
  * `level` - _(optional)_ - defaults to `INFO`, this the level of severity for the message (i.e. `INFO`, `WARN`, `ERROR`, `CRITICAL`)
  * `message` - _(required)_ - if the value of the message is a string, the value is used in this field
  * `timestamp` - _(optional)_ - defaults to now, refers to the date of the event
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `result` - result set details

```javascript
let
  deviceId = '<DEVICE_ID>',
  trackToken = 12345;

client
  .device
  .createEventMessages([{
    message : `track with trackToken ${trackToken} downloaded successfully`,
    timestamp : new Date()
  }]).then(() => {
    console.log('event logged');
  }).catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #createStatusReport

This method can be used to update the API with specific details regarding the status of the device.

**Usage:** `client.device.createStatusReport(deviceId, status, callback)`

* `deviceId` - _(required)_ - should contain the identifier of the device
* `status` - _(required)_ - an object with details regarding the status and settings of the device
  * `TBD` - details regarding this message required
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `result` - result set details

```javascript
let
  deviceId = '<DEVICE_ID>',
  status = {
    // requires definition
  };

client
  .device
  .createStatusReport(deviceId, status)
  .then(() => {
    console.log('status sent!');
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #getAnalytics

This method can be used to retrieve a set of analytics based on a query for devices.

**Usage:** `client.device.getAnalytics(options, callback)`

* `options` - _(optional)_ - can be used to supply additional filters and sorting instructions
  * `start` - the index at which to start selection of items
  * `count` - the total number of items to retrieve (maximum value is `100`)
  * `filters` - additional field projections along with mandatory and optional filters (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
  * `sort` - additional sorting parameters for result (see [API documentation](https://curio-music-api.apps.playnetwork.com/v2/docs?clientId=c96d584b909240ba9cacf1877c0bba09#filtering-and-sorting) for more details)
* `callback` - _(optional)_ - a function callback that accepts two arguments
  * `err` - populated with details in the event of an error
  * `analytics` - the analytics for the devices found

```javascript
client
  .device
  .getAnalytics({
    filters : {
      mandatory : {
        exact : {
          'status.software.version' : 'v1.11.1'
        }
      }
    }
  })
  .then((analytics) => {
    console.log(analytics);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #getDevice

To retrieve details for a particular device, use this method.

**Usage:** `client.device.getDevice(deviceId, options, callback)`

* `deviceId` - _(required)_ - defines the device that should be retrieved
* `options` - _(optional)_ - additional options
* `callback` - _(optional)_ - a function callback that accepts a single argument
  * `err` - populated with details in the event of an error
  * `device` - the device

```javascript
var deviceId = '<DEVICE_ID>';

client
  .device
  .getDevice(deviceId)
  .then((device) => {
    console.log(
      'successfully retrieved device %s',
      device.deviceId);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #getDevices

Works similarly to [getDevice](#getdevice), but allows for multiple devices to be provided as a bulk request.

**Usage:** `client.device.getDevices(deviceIdList, callback)`

* `deviceIdList` - _(required)_ - an array of deviceId values to lookup
* `callback` - _(optional)_ - a function callback that accepts a single argument
  * `err` - populated with details in the event of an error
  * `devices` - the devices

```javascript
var deviceIdList = ['<DEVICE_ID_1>', '<DEVICE_ID_2>', '<DEVICE_ID_3>'];

client
  .device
  .getDevices(deviceIdList)
  .then((devices) => {
    console.log(
      'successfully retrieved %d devices',
      devices.length);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #getGroup

To retrieve details for a particular group of devices, use this method.

**Usage:** `client.device.getGroup(groupId, options, callback)`

* `groupId` - _(required)_ - defines the group that should be retrieved
* `options` - _(optional)_ - additional options
* `callback` - _(optional)_ - a function callback that accepts a single argument
  * `err` - populated with details in the event of an error
  * `group` - the group

```javascript
var groupId = '<GROUP_ID>';

client
  .device
  .getGroup(groupId)
  .then((group) => {
    console.log(
      'successfully retrieved group %s',
      group.deviceGroupId);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #getGroupAnalytics

To retrieve summary analytics for a particular group of devices, use this method.

**Usage:** `client.device.getGroupAnalytics(groupId, options, callback)`

* `groupId` - _(required)_ - defines the group that should be retrieved
* `options` - _(optional)_ - additional options
* `callback` - _(optional)_ - a function callback that accepts a single argument
  * `err` - populated with details in the event of an error
  * `analytics` - the analytics for the group of devices

```javascript
var groupId = '<GROUP_ID>';

client
  .device
  .getGroupAnalytics(groupId)
  .then((analytics) => {
    console.log(analytics);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #getGroupDevices

To retrieve a paginated list of devices for a particular group, use this method.

**Usage:** `client.device.getGroupDevices(groupId, options, callback)`

* `groupId` - _(required)_ - defines the group that should be retrieved
* `options` - _(optional)_ - additional options
* `callback` - _(optional)_ - a function callback that accepts a single argument
  * `err` - populated with details in the event of an error
  * `result` - the result set of the request

```javascript
var groupId = '<GROUP_ID>';

client
  .device
  .getGroupAnalytics(groupId, { start : 0, count : 100 })
  .then((result) => {
    console.log('successfully retrieved 100 of %d devices', result.total);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #getGroups

Works similarly to [getGroup](#getgroup), but allows for multiple groups to be provided as a bulk request.

**Usage:** `client.device.getGroups(groupIdList, callback)`

* `groupIdList` - _(required)_ - an array of deviceGroupId values to lookup
* `callback` - _(optional)_ - a function callback that accepts a single argument
  * `err` - populated with details in the event of an error
  * `groups` - the groups

```javascript
var groupIdList = ['<GROUP_ID_1>', '<GROUP_ID_2>', '<GROUP_ID_3>'];

client
  .device
  .getGroups(groupIdList)
  .then((groups) => {
    console.log(
      'successfully retrieved %d groups',
      groups.length);
  })
  .catch((err) => {
    console.error(err);
  });
```

[back to top](#usage)

#### #getGroupsAnalytics

Works similarly to [getGroupAnalytics](#getgroupanalytics), but allows for multiple groups to be provided as a bulk request.

**Usage:** `client.device.getGroupsAnalytics(groupIdList, callback)`

* `groupIdList` - _(required)_ - an array of deviceGroupId values to lookup
* `callback` - _(optional)_ - a function callback that accepts a single argument
  * `err` - populated with details in the event of an error
  * `analytics` - the analytics for the group of devices

```javascript
var groupIdList = ['<GROUP_ID_1>', '<GROUP_ID_2>', '<GROUP_ID_3>'];

client
  .device
  .getGroupsAnalytics(groupIdList)
  .then((analytics) => {
    console.log(analytics);
  })
  .catch((err) => {
    console.error(err);
  });
```
