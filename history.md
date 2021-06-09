# v2.2.9 - 2020/06/09

* Update services host URLs.

# v2.2.8 - 2020/04/03

* Added support for socket options for player-service socket.
* Use retry/exponential backoff mechanisms for rawStream requests.

# v2.2.7 - 2020/02/19

* Added backoff mechanism to any request called with setting totalTimeout.

# v2.2.6 - 2020/01/08

* Added backoff mechanism to any request called with setting totalTimeout.

# v2.2.5 - 2019/11/15

* Added support for Brand API.

# v2.2.4 - 2019/10/10

* Add promo message support to playback.recordPlay()

# v2.2.3 - 2019/03/27

* Enables the use of a request pool for all requests

# v2.2.2 - 2019/03/06

* Added support for filtering out assets that don't exist

# v2.2.2 - 2019/03/01

* Adjusted playback module to accept `isrc` or `trackId` as a content identifier

# v2.2.1 - 2019/02/19

* Add orderAction to provision module

# v2.2.0 - 2019/02/15

* Added support for originals upsert and reverse lookup for original via asset

# v2.1.3 - 2018/12/05

* Fixed bug preventing uppercase asset identifiers i.e. ISRC and UPC

# v2.1.2 - 2018/12/4

* Merge develop and vnext; relocate old curio routes to v2 namespace

# v2.1.1 - 2018/11/07

* Accidentally published wrong version, bumping version and republishing

# v2.1.0 - 2018/11/07

* Added call to check that asset exists and returns asset id in header

# v1.4.5 - 2018/11/02

* Fixed bug in many sub-modules where ensuring authentication headers was called improperly

# v2.0.0 - 2018/11/01

* Reved major version and reverse merged updates from default branch v1.4.4

# v1.4.4 - 2018/10/31

* Fixed bug preventing asset downloads

# v1.4.3 - 2018/10/31

* Added support for updating clients
* Added support for updating claims

# v1.4.1 - 2018/10/24

* Added additional support methods for keys

# v1.4.0 - 2018/10/15

* Http(s).request now uses a keep-alive agent by default
* "Connection: keep-alive" headers are now sent on every HTTP request by default

# v1.3.19 - 2018/10/15

* Added support for claims retrieval by clientId

# v1.3.17 - 2018/09/19

* Fixing mock stations to add grouping -- private

# v1.3.15 - 2018/08/21

* Wired up v3 collection-api and track-api to Music -- private

# v1.3.14 - 2018/08/30

* Addressed issue in Trello Ticket 574

# v1.3.13 - 2018/08/20

* Fixed bug in provision.createProfile command

# v1.3.12 - 2018/08/13

* Added support for Music/updateBroadcast route

# v1.3.11 - 2018/08/09

* Add support and distinction between filter null values vs empty string

# v1.3.10 - 2018/08/07

* Added getProfile and updateProfile commands to provision proxy

# v1.3.9 - 2018/08/01

* Added support for Music/findBroadcastsByStationId route

# v1.3.8 - 2018/07/06

* Handled exception gracefully when a url doesn't resolve for the player

# v1.3.7 - 2018/03/28

* Added command to check if original asset exists in the Asset API

# v1.3.6 - 2018/03/26

* Added support for Asset API

# v1.3.5

* Added support for key activation

# v1.3.4

* Fixed issue where valid authentication tokens where not always properly accepted

# v1.3.3

* Handled expired authentication token on re-connect

# v1.3.2

* Added support for Provision/Updater route

# v1.3.1

* Added support for Provision/Activation route

# v1.3.0 - 2017/10/18

* Added support for some functionality for Provision API

# v1.2.1 - 2017/08/23

* Fixed bug that was being caused by missing settings method in PlayerProxy.

# v1.1.11 - 2017/05/23

* Fixing bug where Relationship API configuration wasn't being properly supplied.

# v1.1.11 - 2017/05/22

* Added support for some functionality for Location Relationship API

# v1.1.10 - 2017/08/22

* Added support for options to `getTracks` method within the `music` sub-module
* Fixed bug where callback for `deleteSettings` and `getSettings` within `settings` sub-module was being assigned to undeclared variable

# v1.1.9 - 2017/02/23

* Added support for `analytics` filters used in `device-api`

# v1.1.8 - 2017/02/23

* Fixed defect where when `token` was not supplied to `ensureAuthHeaders`, the method would fail

# v1.1.7 - 2017/02/23

* Added support for options to `ensureAuthHeaders` method within the `key` sub-module

# v1.1.6 - 2016/12/23

* Added `allClaims` to `claim` sub-module

# v1.1.5 - 2016/12/23

* Added `upsertDevices` to `device` sub-module
* Added documentation for new methods on `device` sub-module

# v1.1.4 - 2016/12/20

* Added `createDiagnostics` to `device` sub-module

# v1.1.3 - 2016/12/16

* Added `getClient` to `key` sub-module

# v1.1.2 - 2016/12/01

* Added `deleteSettings` to `settings` sub-module

# v1.1.1 - 2016/12/01

* Added `upsertCollections` and `upsertStations` methods to `music` sub-module

# v1.1.0 - 2016/11/16

* Fixed defect in the `recordPlay` method of `playback` sub-module - this change modified the interface for expected data

# v1.0.34 - 2016/10/28

* Resolved `UnhandledPromiseRejectionWarning` messages
* Adjusted rejection for underlying request abstraction to always return `Error` objects

# v1.0.33 - 2016/10/27

* Added `#grantClientAccess` to `key` sub-module

# v1.0.32 - 2016/09/21

* Added `#deletePhysicalLocation` to `location` sub-module

# v1.0.31 - 2016/09/06

* Introduced `locations` sub-module

# v1.0.30 - 2016/09/02

* Added two undocumented methods to `content` sub-module for backend asset auditing tool usage

# v1.0.29 - 2016/08/30

* Introduced method to `content` sub-module allowing for flexible specification of dynamic requests
* Increased unit test coverage for `content` sub-module

# v1.0.28 - 2016/08/30

* Introduced method to `music` sub-module allowing for flexible specification of dynamic requests
* Fixed bug in `music` sub-module where `createPlaylist` did not properly handle when playlist details are omitted during requests where callback is specified
* Fixed bug in `music` sub-module where `updatePlaylist` did not properly handle when playlist details are omitted during requests where callback is specified
* Increased unit test coverage for `music` sub-module

# v1.0.27 - 2016/08/29

* Fixed minor issue where a function in `key` sub-module was incorrectly omitting token

# v1.0.26 - 2016/08/25

* Introduced backend feature to `key` sub-module

# v1.0.25 - 2016/08/19

* Introduced method to purge the token cache

# v1.0.24 - 2016/08/16

* Added `#validateClient` and `#validateToken` methods to `key` sub-module

# v1.0.23 - 2016/08/09

* Fixed internal issue where a `timeout` value specified at-the-time-of-request would not be applied appropriately to the request

# v1.0.22 - 2016/06/22

* Fixed bug with `playback` sub-module where `legacyTrackToken` was not properly validated

# v1.0.21 - 2016/06/22

* Added support for `legacyTrackToken` field when reporting plays via `playback` sub-module

# v1.0.20 - 2016/06/10

* Added `#version` method to each sub-module

# v1.0.19 - 2016/06/01

* Fixed typo in documentation for `playback` sub-module
* Adjusted CLI to use `apply` for backwards compatibility
* Adjusted redirect handling in request abstraction to use original host when missing
* Implemented redirect limit to avoid endless redirect loops

# v1.0.18 - 2016/05/18

* Added support for displaying settings applied, internally, to `key` sub-module
* Moved `ensureAuthHeaders` function to `key` sub-module for better consistency
* Added additional unit tests for `key` sub-module

# v1.0.17 - 2016/05/17

* Adjusted CLI to use ES6 spread operator instead of `apply`
* Moved the emit of the `response` event to occur immediately when response headers are received from the server

# v1.0.16 - 2016/05/16

* Moved `gulp-util` dependency to devDependencies

# v1.0.15 - 2016/05/16

* Fixed issue where date parameters were not properly serialized in ISO format

# v1.0.14 - 2016/05/13

* Added initial support for CLI

# v1.0.13 - 2016/05/12

* Added support for additional request option for each sub-module (timeout)

# v1.0.12 - 2016/05/06

* Fixed defect where date objects could be viewed as empty

# v1.0.11 - 2016/05/05

* Added support for a broader range of options for `configure`
* Enhanced unit test coverage

# v1.0.10 - 2016/05/05

* Added new function to the `content` sub-module that translates a track to an alias
* Added dev-dependency to `gulp-util` for properly formatting Errors found in testing process

# v1.0.9 - 2016/04/20

* Fixed issue where `main` was not specified properly in package.json

# v1.0.8 - 2016/04/14

* Added support for reading configuration keys from a shared configuration file
* Fixed issue where the `#checkLegacyAsset` and `#getLegacyAssetStream` methods (in the `content` sub-module) were not requesting the correct API resource
* Fixed issue where the `#getAssetStream` and `#getLegacyAssetStream` methods (in the `content` sub-module) were not properly following redirects

# v1.0.7 - 2016/04/01

* Fixed defect where authentication token was not being properly re-generated after expiration

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
