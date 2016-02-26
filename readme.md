# PlayNetwork Node.js SDK

## Install

**_COMING SOON_**

```bash
npm install playnetwork-sdk
```

## Usage

### Configuration

The PlayNetwork SDK must be configured with a valid and active `clientId` and `secret` prior to use. If `#configure` is not called, no functionality within the SDK is enabled and all SDK sub-modules (i.e. `music`, `settings`, `content`, etc.) will be `undefined`.

```javascript
var playnetwork = require('playnetwork-sdk');

playnetwork.configure(
  '<CLIENT_ID>',
  '<CLIENT_SECRET>');
```

#### Options

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

* allBroadcasts
* allCollections
* allStations
* createBroadcast
* deleteBroadcast
* getBroadcast
* getCollection
* getStation
* mixCollection
* settings

```javascript
var playnetwork = require('playnetwork-sdk');

// configure the client
playnetwork.configure('<CLIENT_ID>', '<CLIENT_SECRET>');

// get all collections
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
  })
  .then((result) => {
    console.log('found %d collections', result.total);
  })
  .catch((err) => {
    console.error(err);
  });
```
