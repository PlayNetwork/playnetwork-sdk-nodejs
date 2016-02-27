# PlayNetwork Node.js SDK

## Install

**_COMING SOON_**

```bash
npm install playnetwork-sdk
```

## Usage

### Configuration

* [constructor](#constructor)

### Music API Module

* [addPlaylistTracks](#addplaylisttracks)
* [allBroadcasts](#allbroadcasts)
* [allCollections](#allcollections)
* [allCollectionTracks](#allcollectiontracks)
* [allPlaylists](#allplaylists)
* [allPlaylistTracks](#allplaylisttracks)
* [allStations](#allstations)
* [allStationTracks](#allstationtracks)
* [allTracks](#alltracks)
* [checkPlaylistTrack](#checkplaylisttrack)
* [createBroadcast](#createbroadcast)
* [createPlaylist](#createplaylist)
* [deleteBroadcast](#deletebroadcast)
* [deletePlaylist](#deleteplaylist)
* [deletePlaylistTrack](#deleteplaylisttrack)
* [getBroadcast](#getbroadcast)
* [getCollection](#getcollection)
* [getPlaylist](#getplaylist)
* [getStation](#getstation)
* [getTrack](#gettrack)
* [getTracks](#gettracks)
* [mixCollection](#mixcollection)
* [settings](#settings)
* [updatePlaylist](#updateplaylist)

### Configuration

#### Constructor

The PlayNetwork SDK must be configured with a valid and active `clientId` and `secret` prior to use. If `#configure` is not called, no functionality within the SDK is enabled and all SDK sub-modules (i.e. `music`, `settings`, `content`, etc.) will be `undefined`.

```javascript
var playnetwork = require('playnetwork-sdk');

playnetwork.configure(
  '<CLIENT_ID>',
  '<CLIENT_SECRET>');
```

##### Options

The PlayNetwork SDK allows for a set of additional configuration parameters to be specified as an optional argument to the `#configure` method:

```javascript
var
  playnetwork = require('playnetwork-sdk'),
  settings = {
    key : {
      host : 'develop-key-api.apps.playnetwork.com'
    },
    music : {
      host : 'develop-curio-music-api.apps.playnetwork.com'
    }
  };

playnetwork.configure(
  '<CLIENT_ID>',
  '<CLIENT_SECRET>',
  settings);
```

### Music Module

The music module is designed to simplify interaction with the [PlayNetwork CURIOMusic API](https://curio-music-api.apps.playnetwork.com/v2/docs). This module supports the following methods:

#### #addPlaylistTracks

This method can be used to add tracks to an existing custom playlist.

**Usage:** `client.music.addPlaylistTracks(playlistId, tracks, callback)`

* playlistId - _(required)_ - defines the station for which broadcasts should be retrieved
* tracks - _(required)_ - an array of track objects to add to the playlist
  * _NOTE:_ assetId or legacy.trackToken must be supplied
* callback - _(optional)_ - a function callback that accepts two arguments
  * err - populated with details in the event of an error
  * result - result set details

```javascript
client
  .music
  .addPlaylistTracks(
    '<PLAYLIST_ID>',
    [{
      assetId : '<ASSET_ID>'
    }, {
      legacy : {
        trackToken : 12345
      }
    }]
  ).then((result) => {
    console.log('successfully added tracks to playlist');
  }).catch((err) => {
    console.error(err);
  });
```

#### #allBroadcasts

This method can be used to retrieve all accessible broadcasts from the API.

**Usage:** `client.music.allBroadcasts(stationId, options, callback)`

* stationId - _(required)_ - defines the station for which broadcasts should be retrieved
* options - _(optional)_ - can be used to supply additional filters and sorting instructions
* callback - _(optional)_ - a function callback that accepts two arguments
  * err - populated with details in the event of an error
  * result - result set details

```javascript
client
  .music
  .allBroadcasts({
    sort : {
      desc : 'created'
    }
  }).then((result) => {
    console.log('found %d broadcasts', result.total);
  }).catch((err) => {
    console.error(err);
  });
```

#### #allCollections

This method can be used to retrieve all accessible collections from the API.

**Usage:** `client.music.allCollections(options, callback)`

* options - _(optional)_ - can be used to supply additional filters and sorting instructions
* callback - _(optional)_ - a function callback that accepts two arguments
  * err - populated with details in the event of an error
  * result - result set details

```javascript
client
  .music
  .allCollections({
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

#### #allCollectionTracks

#### #allPlaylists

This method can be used to retrieve all custom playlists from the API created by the clientId specified in the `#configure` method.

**Usage:** `client.music.allPlaylists(options, callback)`

* options - _(optional)_ - can be used to supply additional filters and sorting instructions
* callback - _(optional)_ - a function callback that accepts two arguments
  * err - populated with details in the event of an error
  * result - result set details

```javascript
client
  .music
  .allPlaylists({
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

#### #allPlaylistTracks
#### #allStations
#### #allStationTracks
#### #allTracks
#### #checkPlaylistTrack
#### #createBroadcast
#### #createPlaylist
#### #deleteBroadcast
#### #deletePlaylist
#### #deletePlaylistTrack
#### #getBroadcast
#### #getCollection
#### #getPlaylist
#### #getStation
#### #getTracks
#### #getTrack
#### #mixCollection
#### #settings
#### #updatePlaylist
