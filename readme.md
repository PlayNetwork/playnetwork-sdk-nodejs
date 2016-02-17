# PlayNetwork Node.js SDK

## Install

**_COMING SOON_**

```bash
npm install playnetwork-sdk
```

## Usage

```javascript
var
  client,
  options = {
    clientId : '<clientId>',
    secret : '<secret>'
  },
  playnetwork = require('playnetwork-sdk');

client = playnetwork.music(options);

client.collections({ start : 0, count : 100 }).then((data) => {
  console.log(`found ${data.total} collections`);

  data.results.forEach((collection) => {
    console.log(`"${collection.title}" with id ${collection.collectionId}`);
  });
});
```
