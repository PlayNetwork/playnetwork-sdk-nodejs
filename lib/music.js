var
	events = require('events'),

	co = require('co'),

	request = require('./request'),
	validation = require('./validation');

const
	DEFAULT_HOST = 'curio-music-api.apps.playnetwork.com',
	DEFAULT_SECURE = true,
	EVENT_ERROR = 'error',
	EVENT_REQUEST = 'request',
	EVENT_RESPONSE = 'response',
	STATUS_CODE_NOT_FOUND = 404,
	STATUS_CODE_SUCCESS = 200,
	TRACK_TOKEN_ALIAS_PREFIX = 'tracktoken';


module.exports = function (musicOptions, ensureAuthHeaders, self) {
	'use strict';

	// enable events
	self = Object.create(events.EventEmitter.prototype);
	events.EventEmitter.call(self);

	// local vars
	let
		req,
		settings = {};

	// determine settings
	settings.host =
		validation.isEmpty(musicOptions) || validation.isEmpty(musicOptions.host) ?
			DEFAULT_HOST :
			musicOptions.host;

	settings.secure =
		validation.isEmpty(musicOptions) || validation.isEmpty(musicOptions.secure) ?
			DEFAULT_SECURE :
			musicOptions.secure;

	// apply additional optional settings if supplied
	settings = validation.applyOptionalParameters(musicOptions, settings);

	// ensure request is setup
	req = new request.Request(settings);
	req.on(EVENT_REQUEST, (data) => (self.emit(EVENT_REQUEST, data)));
	req.on(EVENT_RESPONSE, (data) => (self.emit(EVENT_RESPONSE, data)));

	function buildTrackAlias (track) {
		if (typeof track === 'string') {
			return track;
		}

		if (!validation.isEmpty(track.legacy) && !validation.isEmpty(track.legacy.trackToken)) {
			return [TRACK_TOKEN_ALIAS_PREFIX, track.legacy.trackToken].join(':');
		}

		return track.assetId;
	}

	self.addPlaylistTracks = (playlistId, tracks, callback) => {
		// handle any non-specified input params
		if (typeof tracks === 'function') {
			callback = tracks;
			tracks = undefined;
		}

		if (typeof playlistId === 'function') {
			callback = playlistId;
			playlistId = undefined;
			tracks = undefined;
		}

		let exec = co(function *() {
			let errorIndex = -1;

			if (validation.isEmpty(playlistId)) {
				return yield Promise.reject(new Error('playlistId is required'));
			}

			if (validation.isEmpty(tracks)) {
				return yield Promise.reject(new Error('tracks are required'));
			}

			if (!Array.isArray(tracks)) {
				tracks = [tracks];
			}

			tracks.some((track, i) => {
				if (validation.isEmpty(track.assetId) &&
					(validation.isEmpty(track.legacy) ||
					validation.isEmpty(track.legacy.trackToken))) {
					errorIndex = i;
				}

				return errorIndex >= 0;
			});

			if (errorIndex >= 0) {
				return yield Promise.reject(
					new Error(`track at index ${errorIndex} is missing identifier`));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.post({
				headers : headers,
				pathname : `/v2/playlists/${playlistId}/tracks`
			}, tracks);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.allBroadcasts = (stationId, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof stationId === 'function') {
			callback = stationId;
			stationId = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(stationId)) {
				return yield Promise.reject(new Error('stationId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : `/v2/stations/${stationId}/broadcasts`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.allCollections = (options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		let exec = co(function *() {
			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : '/v2/collections',
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.allCollectionTracks = (collectionId, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof collectionId === 'function') {
			callback = collectionId;
			collectionId = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(collectionId)) {
				return yield Promise.reject(new Error('collectionId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : `/v2/collections/${collectionId}/tracks`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.allPlaylists = (options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		let exec = co(function *() {
			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : '/v2/playlists',
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.allPlaylistTracks = (playlistId, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof playlistId === 'function') {
			callback = playlistId;
			playlistId = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(playlistId)) {
				return yield Promise.reject(new Error('playlistId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : `/v2/playlists/${playlistId}/tracks`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.allStations = (options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		let exec = co(function *() {
			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : '/v2/stations',
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.allStationTracks = (stationId, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof stationId === 'function') {
			callback = stationId;
			stationId = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(stationId)) {
				return yield Promise.reject(new Error('stationId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : `/v2/stations/${stationId}/tracks`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.allTracks = (options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		let exec = co(function *() {
			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : '/v2/tracks',
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.call = (options, callback) => {
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(options)) {
				return yield Promise.reject(new Error('options are required'));
			}

			if (validation.isEmpty(options.pathname)) {
				return yield Promise.reject(new Error('options.pathname is required'));
			}

			if (validation.isEmpty(options.method) || typeof options.method !== 'string') {
				options.method = 'get';
			} else {
				options.method = options.method.toLowerCase();
			}

			let headers = yield ensureAuthHeaders();

			return yield req[options.method]({
				headers : headers,
				pathname : options.pathname
			}, options.data);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.checkPlaylistTrack = (playlistId, track, callback) => {
		// handle any non-specified input params
		if (typeof track === 'function') {
			callback = track;
			track = undefined;
		}

		if (typeof playlistId === 'function') {
			callback = playlistId;
			playlistId = undefined;
			track = undefined;
		}

		let exec = new Promise((resolve, reject) => {
			if (validation.isEmpty(playlistId)) {
				return reject(new Error('playlistId is required'));
			}

			if (validation.isEmpty(track)) {
				return reject(new Error('track is required'));
			}

			let alias = buildTrackAlias(track);

			if (validation.isEmpty(alias)) {
				return reject(new Error('track is missing identifier'));
			}

			return ensureAuthHeaders()
				.then((headers) => {
					req
						.head({
							headers : headers,
							pathname : `/v2/playlists/${playlistId}/tracks/${alias}`
						})
						.then(() => resolve(true))
						.catch((err) => {
							if (err.statusCode && err.statusCode === STATUS_CODE_NOT_FOUND) {
								return resolve(false);
							}

							return reject(err);
						});
				});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.createBroadcast = (stationId, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof stationId === 'function') {
			callback = stationId;
			stationId = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(stationId)) {
				return yield Promise.reject(new Error('stationId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.post({
				headers : headers,
				pathname : `/v2/stations/${stationId}/broadcasts`
			}, options);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.createPlaylist = (playlist, callback) => {
		// handle any non-specified input params
		if (typeof playlist === 'function') {
			callback = playlist;
			playlist = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(playlist)) {
				return yield Promise.reject(new Error('playlist is required'));
			}

			if (validation.isEmpty(playlist.title)) {
				return yield Promise.reject(new Error('playlist title is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.post({
				headers : headers,
				pathname : '/v2/playlists'
			}, playlist);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.deleteBroadcast = (stationId, broadcastId, callback) => {
		// handle any non-specified input params
		if (typeof broadcastId === 'function') {
			callback = broadcastId;
			broadcastId = undefined;
		}

		if (typeof stationId === 'function') {
			callback = stationId;
			stationId = undefined;
			broadcastId = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(stationId)) {
				return yield Promise.reject(new Error('stationId is required'));
			}

			if (validation.isEmpty(broadcastId)) {
				return yield Promise.reject(new Error('broadcastId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.delete({
				headers : headers,
				pathname : `/v2/stations/${stationId}/broadcasts/${broadcastId}`
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.deletePlaylist = (playlistId, callback) => {
		// handle any non-specified input params
		if (typeof playlistId === 'function') {
			callback = playlistId;
			playlistId = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(playlistId)) {
				return yield Promise.reject(new Error('playlistId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.delete({
				headers : headers,
				pathname : `/v2/playlists/${playlistId}`
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.deletePlaylistTrack = (playlistId, track, callback) => {
		// handle any non-specified input params
		if (typeof track === 'function') {
			callback = track;
			track = undefined;
		}

		if (typeof playlistId === 'function') {
			callback = playlistId;
			playlistId = undefined;
			track = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(playlistId)) {
				return yield Promise.reject(new Error('playlistId is required'));
			}

			if (validation.isEmpty(track)) {
				return yield Promise.reject(new Error('track is required'));
			}

			let
				alias = buildTrackAlias(track),
				headers = yield ensureAuthHeaders();

			if (validation.isEmpty(alias)) {
				return yield Promise.reject(new Error('track is missing identifier'));
			}

			return yield req.delete({
				headers : headers,
				pathname : `/v2/playlists/${playlistId}/tracks/${alias}`
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.findBroadcastsByStationId = (stationId, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof stationId === 'function') {
			callback = stationId;
			stationId = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(stationId)) {
				return yield Promise.reject(new Error('stationId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : `/v2/stations/${stationId}/broadcasts`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getBroadcast = (stationId, broadcastId, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof broadcastId === 'function') {
			callback = broadcastId;
			broadcastId = undefined;
			options = undefined;
		}

		if (typeof stationId === 'function') {
			callback = stationId;
			stationId = undefined;
			broadcastId = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(stationId)) {
				return yield Promise.reject(new Error('stationId is required'));
			}

			if (validation.isEmpty(broadcastId)) {
				return yield Promise.reject(new Error('broadcastId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : `/v2/stations/${stationId}/broadcasts/${broadcastId}`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getCollection = (collectionId, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof collectionId === 'function') {
			callback = collectionId;
			collectionId = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(collectionId)) {
				return yield Promise.reject(new Error('collectionId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : `/v2/collections/${collectionId}`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getPlaylist = (playlistId, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof playlistId === 'function') {
			callback = playlistId;
			playlistId = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(playlistId)) {
				return yield Promise.reject(new Error('playlistId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : `/v2/playlists/${playlistId}`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getStation = (stationId, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof stationId === 'function') {
			callback = stationId;
			stationId = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(stationId)) {
				return yield Promise.reject(new Error('stationId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : `/v2/stations/${stationId}`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getTrack = (trackAlias, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof trackAlias === 'function') {
			callback = trackAlias;
			trackAlias = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(trackAlias)) {
				return yield Promise.reject(new Error('trackAlias is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : `/v2/tracks/${trackAlias}`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getTracks = (tracks, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof tracks === 'function') {
			callback = tracks;
			tracks = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(tracks)) {
				return yield Promise.reject(new Error('tracks are required'));
			}

			if (!Array.isArray(tracks)) {
				tracks = [tracks];
			}

			let
				headers = yield ensureAuthHeaders(),
				trackAliasList = tracks
					.map((track) => (buildTrackAlias(track)))
					.filter((alias) => (!validation.isEmpty(alias)));

			if (validation.isEmpty(trackAliasList)) {
				return yield Promise.reject(new Error('tracks are required'));
			}

			return yield req.post({
				headers : headers,
				pathname : '/v2/tracks/trackIds',
				query : options
			}, tracks);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.mixCollection = (collectionId, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof collectionId === 'function') {
			callback = collectionId;
			collectionId = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(collectionId)) {
				return yield Promise.reject(new Error('collectionId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : `/v2/collections/${collectionId}/mix`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.settings = () => (settings);

	self.updateBroadcast = (stationId, broadcast, callback) => {
		// handle any non-specified input params
		if (typeof broadcast === 'function') {
			callback = broadcast;
			broadcast = undefined;
		}

		if (typeof stationId === 'function') {
			callback = stationId;
			stationId = undefined;
			broadcast = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(stationId)) {
				return yield Promise.reject(new Error('stationId is required'));
			}

			if (validation.isEmpty(broadcast)) {
				return yield Promise.reject(new Error('broadcast is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.put({
				headers : headers,
				pathname : `/v2/stations/${stationId}/broadcasts`
			}, broadcast);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.updatePlaylist = (playlist, callback) => {
		// handle any non-specified input params
		if (typeof playlist === 'function') {
			callback = playlist;
			playlist = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(playlist)) {
				return yield Promise.reject(new Error('playlist is required'));
			}

			if (validation.isEmpty(playlist.playlistId)) {
				return yield Promise.reject(new Error('playlistId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.put({
				headers : headers,
				pathname : `/v2/playlists/${playlist.playlistId}`
			}, playlist);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.upsertCollections = (collections, callback) => {
		// handle any non-specified input params
		if (typeof collections === 'function') {
			callback = collections;
			collections = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(collections)) {
				return yield Promise.reject(new Error('collections are required'));
			}

			// ensure the collections are in an array format
			if (!Array.isArray(collections)) {
				collections = [collections];
			}

			let
				err,
				foundError = collections.some((collection, i) => {
					if (validation.isEmpty(collection.collectionId) && validation.isEmpty(collection.legacy)) {
						err = new Error(
							`collection ${i} of ${collections.length}: collectionId or legacy identifiers are required`);
						return true;
					}

					return false;
				}),
				headers;

			if (foundError) {
				return yield Promise.reject(err);
			}

			headers = yield ensureAuthHeaders();

			return yield req.put({
				headers : headers,
				pathname : '/v2/collections'
			}, collections);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.upsertStations = (stations, callback) => {
		// handle any non-specified input params
		if (typeof stations === 'function') {
			callback = stations;
			stations = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(stations)) {
				return yield Promise.reject(new Error('stations are required'));
			}

			// ensure the collections are in an array format
			if (!Array.isArray(stations)) {
				stations = [stations];
			}

			let
				err,
				foundError = stations.some((station, i) => {
					if (validation.isEmpty(station.stationId) && validation.isEmpty(station.legacy)) {
						err = new Error(
							`station ${i} of ${stations.length}: stationId or legacy identifiers are required`);
						return true;
					}

					return false;
				}),
				headers;

			if (foundError) {
				return yield Promise.reject(err);
			}

			headers = yield ensureAuthHeaders();

			return yield req.put({
				headers : headers,
				pathname : '/v2/stations'
			}, stations);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.version = (callback) => {
		let exec = co(function *() {
			return yield req.get({
				pathname : '/v2/version'
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	return self;
};
