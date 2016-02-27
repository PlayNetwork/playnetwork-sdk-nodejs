var
	events = require('events'),

	co = require('co'),

	request = require('./request'),
	validation = require('./validation');

const
	DEFAULT_HOST = 'curio-music-api.apps.playnetwork.com',
	DEFAULT_SECURE = true,
	EVENT_REQUEST = 'request',
	EVENT_RESPONSE = 'response',
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
			if (validation.isEmpty(playlistId)) {
				throw new Error('playlistId is required');
			}

			if (validation.isEmpty(tracks)) {
				throw new Error('tracks are required');
			}

			if (!Array.isArray(tracks)) {
				tracks = [tracks];
			}

			tracks.forEach((track, i) => {
				let isValid =
					!validation.isEmpty(track.assetId) ||
					(!validation.isEmpty(track.legacy) &&
					!validation.isEmpty(track.legacy.trackToken));

				if (!isValid) {
					throw new Error(`track at index ${i} is missing identifier`);
				}
			});

			let headers = yield ensureAuthHeaders;

			return yield req.post({
				headers : headers,
				pathname : `/v2/playlists/${playlistId}/tracks`
			}, tracks);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.allBroadcasts = (stationId, query, callback) => {
		// handle any non-specified input params
		if (typeof query === 'function') {
			callback = query;
			query = undefined;
		}

		if (typeof stationId === 'function') {
			callback = stationId;
			stationId = undefined;
			query = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(stationId)) {
				throw new Error('stationId is required');
			}

			let headers = yield ensureAuthHeaders;

			return yield req.get({
				headers : headers,
				pathname : `/v2/stations/${stationId}/broadcasts`,
				query : query
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.allCollections = (query, callback) => {
		// handle any non-specified input params
		if (typeof query === 'function') {
			callback = query;
			query = undefined;
		}

		let exec = co(function *() {
			let headers = yield ensureAuthHeaders;

			return yield req.get({
				headers : headers,
				pathname : '/v2/collections',
				query : query
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.allCollectionTracks = (collectionId, query, callback) => {
		// handle any non-specified input params
		if (typeof query === 'function') {
			callback = query;
			query = undefined;
		}

		if (typeof collectionId === 'function') {
			callback = collectionId;
			collectionId = undefined;
			query = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(collectionId)) {
				throw new Error('collectionId is required');
			}

			let headers = yield ensureAuthHeaders;

			return yield req.get({
				headers : headers,
				pathname : `/v2/collections/${collectionId}/tracks`,
				query : query
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.allPlaylists = (query, callback) => {
		// handle any non-specified input params
		if (typeof query === 'function') {
			callback = query;
			query = undefined;
		}

		let exec = co(function *() {
			let headers = yield ensureAuthHeaders;

			return yield req.get({
				headers : headers,
				pathname : '/v2/playlists',
				query : query
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.allPlaylistTracks = (playlistId, query, callback) => {
		// handle any non-specified input params
		if (typeof query === 'function') {
			callback = query;
			query = undefined;
		}

		if (typeof playlistId === 'function') {
			callback = playlistId;
			playlistId = undefined;
			query = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(playlistId)) {
				throw new Error('playlistId is required');
			}

			let headers = yield ensureAuthHeaders;

			return yield req.get({
				headers : headers,
				pathname : `/v2/playlists/${playlistId}/tracks`,
				query : query
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.allStations = (query, callback) => {
		// handle any non-specified input params
		if (typeof query === 'function') {
			callback = query;
			query = undefined;
		}

		let exec = co(function *() {
			let headers = yield ensureAuthHeaders;

			return yield req.get({
				headers : headers,
				pathname : '/v2/stations',
				query : query
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.allStationTracks = (stationId, query, callback) => {
		// handle any non-specified input params
		if (typeof query === 'function') {
			callback = query;
			query = undefined;
		}

		if (typeof stationId === 'function') {
			callback = stationId;
			stationId = undefined;
			query = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(stationId)) {
				throw new Error('stationId is required');
			}

			let headers = yield ensureAuthHeaders;

			return yield req.get({
				headers : headers,
				pathname : `/v2/stations/${stationId}/tracks`,
				query : query
			});
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

		let exec = co(function *() {
			if (validation.isEmpty(playlistId)) {
				throw new Error('playlistId is required');
			}

			if (validation.isEmpty(track)) {
				throw new Error('track is required');
			}

			let
				alias = buildTrackAlias(track),
				headers = yield ensureAuthHeaders;

			if (validation.isEmpty(alias)) {
				throw new Error('track is missing identifier');
			}

			return yield req.head({
				headers : headers,
				pathname : `/v2/playlists/${playlistId}/tracks/${alias}`
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
				throw new Error('stationId is required');
			}

			let headers = yield ensureAuthHeaders;

			return yield req.post({
				headers : headers,
				pathname : `/v2/stations/${stationId}/broadcasts`
			}, options);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.createPlaylist = (playlist, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = playlist;
			playlist = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(playlist)) {
				throw new Error('playlist is required');
			}

			if (validation.isEmpty(playlist.title)) {
				throw new Error('playlist title is required');
			}

			let headers = yield ensureAuthHeaders;

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
				throw new Error('stationId is required');
			}

			if (validation.isEmpty(broadcastId)) {
				throw new Error('broadcastId is required');
			}

			let headers = yield ensureAuthHeaders;

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
				throw new Error('playlistId is required');
			}

			let headers = yield ensureAuthHeaders;

			return yield req.delete({
				headers : headers,
				pathname : `/v2/playlists/${playlistId}`
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getBroadcast = (stationId, broadcastId, query, callback) => {
		// handle any non-specified input params
		if (typeof query === 'function') {
			callback = query;
			query = undefined;
		}

		if (typeof broadcastId === 'function') {
			callback = broadcastId;
			broadcastId = undefined;
			query = undefined;
		}

		if (typeof stationId === 'function') {
			callback = stationId;
			stationId = undefined;
			broadcastId = undefined;
			query = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(stationId)) {
				throw new Error('stationId is required');
			}

			if (validation.isEmpty(broadcastId)) {
				throw new Error('broadcastId is required');
			}

			let headers = yield ensureAuthHeaders;

			return yield req.get({
				headers : headers,
				pathname : `/v2/stations/${stationId}/broadcasts/${broadcastId}`,
				query : query
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getCollection = (collectionId, query, callback) => {
		// handle any non-specified input params
		if (typeof query === 'function') {
			callback = query;
			query = undefined;
		}

		if (typeof collectionId === 'function') {
			callback = collectionId;
			collectionId = undefined;
			query = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(collectionId)) {
				throw new Error('collectionId is required');
			}

			let headers = yield ensureAuthHeaders;

			return yield req.get({
				headers : headers,
				pathname : `/v2/collections/${collectionId}`,
				query : query
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getPlaylist = (playlistId, query, callback) => {
		// handle any non-specified input params
		if (typeof query === 'function') {
			callback = query;
			query = undefined;
		}

		if (typeof playlistId === 'function') {
			callback = playlistId;
			playlistId = undefined;
			query = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(playlistId)) {
				throw new Error('playlistId is required');
			}

			let headers = yield ensureAuthHeaders;

			return yield req.get({
				headers : headers,
				pathname : `/v2/playlists/${playlistId}`,
				query : query
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getStation = (stationId, query, callback) => {
		// handle any non-specified input params
		if (typeof query === 'function') {
			callback = query;
			query = undefined;
		}

		if (typeof stationId === 'function') {
			callback = stationId;
			stationId = undefined;
			query = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(stationId)) {
				throw new Error('stationId is required');
			}

			let headers = yield ensureAuthHeaders;

			return yield req.get({
				headers : headers,
				pathname : `/v2/stations/${stationId}`,
				query : query
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.mixCollection = (collectionId, query, callback) => {
		// handle any non-specified input params
		if (typeof query === 'function') {
			callback = query;
			query = undefined;
		}

		if (typeof collectionId === 'function') {
			callback = collectionId;
			collectionId = undefined;
			query = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(collectionId)) {
				throw new Error('collectionId is required');
			}

			let headers = yield ensureAuthHeaders;

			return yield req.get({
				headers : headers,
				pathname : `/v2/collections/${collectionId}/mix`,
				query : query
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.settings = () => (settings);

	return self;
};
