var
	events = require('events'),

	co = require('co'),

	request = require('./request'),
	validation = require('./validation'),
	hosts = require('./hosts');

const
	DEFAULT_COLLECTION_HOST = 'master-collectionapi.scaffold-workers-ext-main-us.m.cld.octavelive.com',
	DEFAULT_STATION_HOST = 'master-stationapi.scaffold-workers-ext-main-us.m.cld.octavelive.com',
	DEFAULT_TRACK_HOST = 'master-trackapi.scaffold-workers-ext-main-us.m.cld.octavelive.com',
	DEFAULT_V2_HOST = hosts.CURIO_MUSIC_API,
	DEFAULT_SECURE = true,
	EVENT_ERROR = 'error',
	EVENT_REQUEST = 'request',
	EVENT_RESPONSE = 'response',
	STATUS_CODE_NOT_FOUND = 404,
	STATUS_CODE_SUCCESS = 200,
	TRACK_TOKEN_ALIAS_PREFIX = 'tracktoken';

/* Template:
{
	'music' : {
		'collection' : {
			'host': '',
			'secure': true
		},
		'station' : {
			'host': '',
			'secure': true
		},
		'track': {
			'host': '',
			'secure' : true
		},
		'v2': {
			'host': '',
			'secure' : true
		}
	}
}
*/

module.exports = function (musicOptions, ensureAuthHeaders, self) {
	'use strict';

	// enable events
	self = Object.create(events.EventEmitter.prototype);
	events.EventEmitter.call(self);

	// local vars
	let
		collectionReq,
		settings = {
			collection : {},
			station : {},
			track : {},
			v2 : {}
		},
		stationReq,
		trackReq,
		v2Req;

	// determine settings
	settings.collection.host =
		validation.isEmpty(musicOptions) || 
		validation.isEmpty(musicOptions.collection) || 
		validation.isEmpty(musicOptions.collection.host) ?
			DEFAULT_COLLECTION_HOST :
			musicOptions.collection.host;

	settings.station.host =
		validation.isEmpty(musicOptions) || 
		validation.isEmpty(musicOptions.station) ||
		validation.isEmpty(musicOptions.station.host) ?
			DEFAULT_STATION_HOST :
			musicOptions.station.host;

	settings.track.host =
		validation.isEmpty(musicOptions) || 
		validation.isEmpty(musicOptions.track) ||
		validation.isEmpty(musicOptions.track.host) ?
			DEFAULT_TRACK_HOST :
			musicOptions.track.host;

	settings.v2.host =
		validation.isEmpty(musicOptions) ||
		validation.isEmpty(musicOptions.v2) || 
		validation.isEmpty(musicOptions.v2.host) ?
			DEFAULT_V2_HOST :
			musicOptions.v2.host;

	settings.collection.secure =
		validation.isEmpty(musicOptions) || 
		validation.isEmpty(musicOptions.collection) || 
		validation.isEmpty(musicOptions.collection.secure) ?
			DEFAULT_SECURE :
			musicOptions.collection.secure;

	settings.station.secure =
		validation.isEmpty(musicOptions) || 
		validation.isEmpty(musicOptions.station) ||
		validation.isEmpty(musicOptions.station.secure) ?
			DEFAULT_SECURE :
			musicOptions.station.secure;

	settings.track.secure =
		validation.isEmpty(musicOptions) || 
		validation.isEmpty(musicOptions.track) ||
		validation.isEmpty(musicOptions.track.secure) ?
			DEFAULT_SECURE :
			musicOptions.track.secure;

	settings.v2.secure =
		validation.isEmpty(musicOptions) ||
		validation.isEmpty(musicOptions.v2) ||
		validation.isEmpty(musicOptions.v2.secure) ?
			DEFAULT_SECURE :
			musicOptions.v2.secure;

	// apply additional optional settings if supplied
	if (!validation.isEmpty(musicOptions)) {
		settings.collection = validation.applyOptionalParameters(musicOptions.collection, settings.collection);
		settings.station = validation.applyOptionalParameters(musicOptions.station, settings.station);
		settings.track = validation.applyOptionalParameters(musicOptions.track, settings.track);
		settings.v2 = validation.applyOptionalParameters(musicOptions.v2, settings.v2);
	}

	// ensure request is setup
	collectionReq = new request.Request(settings.collection);
	collectionReq.on(EVENT_REQUEST, (data) => (self.emit(EVENT_REQUEST, data)));
	collectionReq.on(EVENT_RESPONSE, (data) => (self.emit(EVENT_RESPONSE, data)));

	stationReq = new request.Request(settings.station);
	stationReq.on(EVENT_REQUEST, (data) => (self.emit(EVENT_REQUEST, data)));
	stationReq.on(EVENT_RESPONSE, (data) => (self.emit(EVENT_RESPONSE, data)));

	trackReq = new request.Request(settings.track);
	trackReq.on(EVENT_REQUEST, (data) => (self.emit(EVENT_REQUEST, data)));
	trackReq.on(EVENT_RESPONSE, (data) => (self.emit(EVENT_RESPONSE, data)));

	v2Req = new request.Request(settings.v2);
	v2Req.on(EVENT_REQUEST, (data) => (self.emit(EVENT_REQUEST, data)));
	v2Req.on(EVENT_RESPONSE, (data) => (self.emit(EVENT_RESPONSE, data)));

	function buildTrackAlias (track) {
		if (typeof track === 'string') {
			return track;
		}

		if (!validation.isEmpty(track.legacy) && !validation.isEmpty(track.legacy.trackToken)) {
			return [TRACK_TOKEN_ALIAS_PREFIX, track.legacy.trackToken].join(':');
		}

		return track.assetId;
	}

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

			let headers = yield ensureAuthHeaders(options);

			return yield stationReq.get({
				headers : headers,
				pathname : `/v3/stations/${stationId}/broadcasts`,
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
			let headers = yield ensureAuthHeaders(options);

			return yield collectionReq.get({
				headers : headers,
				pathname : '/v3/collections',
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

			let headers = yield ensureAuthHeaders(options);

			return yield collectionReq.get({
				headers : headers,
				pathname : `/v3/collections/${collectionId}/tracks`,
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
			let headers = yield ensureAuthHeaders(options);

			return yield stationReq.get({
				headers : headers,
				pathname : '/v3/stations',
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

/*
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

			let headers = yield ensureAuthHeaders(options);

			return yield stationReq.get({
				headers : headers,
				pathname : `/v3/stations/${stationId}/tracks`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};*/

	self.allTracks = (options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		let exec = co(function *() {
			let headers = yield ensureAuthHeaders(options);

			return yield trackReq.get({
				headers : headers,
				pathname : '/v3/tracks',
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.callCollection = (options, callback) => {
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

			let headers = yield ensureAuthHeaders(options);

			return yield collectionReq[options.method]({
				headers : headers,
				pathname : options.pathname
			}, options.data);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.callStation = (options, callback) => {
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

			let headers = yield ensureAuthHeaders(options);

			return yield stationReq[options.method]({
				headers : headers,
				pathname : options.pathname
			}, options.data);
		});

		return validation.promiseOrCallback(exec, callback);
	};


	self.callTrack = (options, callback) => {
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

			let headers = yield ensureAuthHeaders(options);

			return yield trackReq[options.method]({
				headers : headers,
				pathname : options.pathname
			}, options.data);
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

			let headers = yield ensureAuthHeaders(options);

			return yield stationReq.post({
				headers : headers,
				pathname : `/v3/stations/${stationId}/broadcasts`
			}, options);
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

			return yield stationReq.delete({
				headers : headers,
				pathname : `/v3/stations/${stationId}/broadcasts/${broadcastId}`
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

			let headers = yield ensureAuthHeaders(options);

			return yield stationReq.get({
				headers : headers,
				pathname : `/v3/stations/${stationId}/broadcasts/${broadcastId}`,
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

			let headers = yield ensureAuthHeaders(options);

			return yield collectionReq.get({
				headers : headers,
				pathname : `/v3/collections/${collectionId}`,
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

			let headers = yield ensureAuthHeaders(options);

			return yield stationReq.get({
				headers : headers,
				pathname : `/v3/stations/${stationId}`,
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

			let headers = yield ensureAuthHeaders(options);

			return yield trackReq.get({
				headers : headers,
				pathname : `/v3/tracks/${trackAlias}`,
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

			let headers = yield ensureAuthHeaders(options);

			return yield trackReq.post({
				headers : headers,
				pathname : '/v3/tracks/aliases',
				query : options
			}, tracks);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.settings = () => (settings);

	self.updateBroadcast = (stationId, broadcastId, broadcast, callback) => {
		// handle any non-specified input params
		if (typeof broadcast === 'function') {
			callback = broadcast;
			broadcast = undefined;
		}

		if (typeof broadcastId === 'function') {
			callback = broadcastId;
			broadcastId = undefined;
			broadcast = undefined;
		}

		if (typeof stationId === 'function') {
			callback = stationId;
			stationId = undefined;
			broadcastId = undefined;
			broadcast = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(stationId)) {
				return yield Promise.reject(new Error('stationId is required'));
			}

			if (validation.isEmpty(broadcastId)) {
				return yield Promise.reject(new Error('broadcastId is required'));
			}

			if (validation.isEmpty(broadcast)) {
				return yield Promise.reject(new Error('broadcast is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield stationReq.put({
				headers : headers,
				pathname : `/v3/stations/${stationId}/broadcasts/${broadcastId}`
			}, broadcast);
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
					if (validation.isEmpty(collection.collectionId)) {
						err = new Error(
							`collection ${i} of ${collections.length}: collectionId is required`);
						return true;
					}

					return false;
				}),
				headers;

			if (foundError) {
				return yield Promise.reject(err);
			}

			headers = yield ensureAuthHeaders();

			return yield collectionReq.put({
				headers : headers,
				pathname : '/v3/collections'
			}, collections);
		});

		return validation.promiseOrCallback(exec, callback);
	};

/*
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

			return yield stationReq.put({
				headers : headers,
				pathname : '/v3/stations'
			}, stations);
		});

		return validation.promiseOrCallback(exec, callback);
	};*/

	self.v2 = {
		addPlaylistTracks: (playlistId, tracks, callback) => {
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
	
				return yield v2Req.post({
					headers : headers,
					pathname : `/v2/playlists/${playlistId}/tracks`
				}, tracks);
			});
	
			return validation.promiseOrCallback(exec, callback);
		},
		allBroadcasts: (stationId, options, callback) => {
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
	
				return yield v2Req.get({
					headers : headers,
					pathname : `/v2/stations/${stationId}/broadcasts`,
					query : options
				});
			});
	
			return validation.promiseOrCallback(exec, callback);
		},
		allCollections: (options, callback) => {
			// handle any non-specified input params
			if (typeof options === 'function') {
				callback = options;
				options = undefined;
			}
	
			let exec = co(function *() {
				let headers = yield ensureAuthHeaders();
	
				return yield v2Req.get({
					headers : headers,
					pathname : '/v2/collections',
					query : options
				});
			});
	
			return validation.promiseOrCallback(exec, callback);
		},
		allCollectionTracks: (collectionId, options, callback) => {
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
	
				return yield v2Req.get({
					headers : headers,
					pathname : `/v2/collections/${collectionId}/tracks`,
					query : options
				});
			});
	
			return validation.promiseOrCallback(exec, callback);
		},
		allPlaylists: (options, callback) => {
			// handle any non-specified input params
			if (typeof options === 'function') {
				callback = options;
				options = undefined;
			}
	
			let exec = co(function *() {
				let headers = yield ensureAuthHeaders();
	
				return yield v2Req.get({
					headers : headers,
					pathname : '/v2/playlists',
					query : options
				});
			});
	
			return validation.promiseOrCallback(exec, callback);
		},
		allPlaylistTracks: (playlistId, options, callback) => {
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
	
				return yield v2Req.get({
					headers : headers,
					pathname : `/v2/playlists/${playlistId}/tracks`,
					query : options
				});
			});
	
			return validation.promiseOrCallback(exec, callback);
		},
		allStations: (options, callback) => {
			// handle any non-specified input params
			if (typeof options === 'function') {
				callback = options;
				options = undefined;
			}
	
			let exec = co(function *() {
				let headers = yield ensureAuthHeaders();
	
				return yield v2Req.get({
					headers : headers,
					pathname : '/v2/stations',
					query : options
				});
			});
	
			return validation.promiseOrCallback(exec, callback);
		},
		allStationTracks: (stationId, options, callback) => {
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
	
				return yield v2Req.get({
					headers : headers,
					pathname : `/v2/stations/${stationId}/tracks`,
					query : options
				});
			});
	
			return validation.promiseOrCallback(exec, callback);
		},
		allTracks: (options, callback) => {
			// handle any non-specified input params
			if (typeof options === 'function') {
				callback = options;
				options = undefined;
			}
	
			let exec = co(function *() {
				let headers = yield ensureAuthHeaders();
	
				return yield v2Req.get({
					headers : headers,
					pathname : '/v2/tracks',
					query : options
				});
			});
	
			return validation.promiseOrCallback(exec, callback);
		},
		call: (options, callback) => {
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
	
				return yield v2Req[options.method]({
					headers : headers,
					pathname : options.pathname
				}, options.data);
			});
	
			return validation.promiseOrCallback(exec, callback);
		},
		checkPlaylistTrack: (playlistId, track, callback) => {
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
						v2Req
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
		},
		createBroadcast: (stationId, options, callback) => {
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
	
				return yield v2Req.post({
					headers : headers,
					pathname : `/v2/stations/${stationId}/broadcasts`
				}, options);
			});
	
			return validation.promiseOrCallback(exec, callback);
		},
		createPlaylist: (playlist, callback) => {
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
	
				return yield v2Req.post({
					headers : headers,
					pathname : '/v2/playlists'
				}, playlist);
			});
	
			return validation.promiseOrCallback(exec, callback);
		},
		deleteBroadcast: (stationId, broadcastId, callback) => {
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
	
				return yield v2Req.delete({
					headers : headers,
					pathname : `/v2/stations/${stationId}/broadcasts/${broadcastId}`
				});
			});
	
			return validation.promiseOrCallback(exec, callback);
		},
		deletePlaylist: (playlistId, callback) => {
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
	
				return yield v2Req.delete({
					headers : headers,
					pathname : `/v2/playlists/${playlistId}`
				});
			});
	
			return validation.promiseOrCallback(exec, callback);
		},
		deletePlaylistTrack: (playlistId, track, callback) => {
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
	
				return yield v2Req.delete({
					headers : headers,
					pathname : `/v2/playlists/${playlistId}/tracks/${alias}`
				});
			});
	
			return validation.promiseOrCallback(exec, callback);
		},
		findBroadcastsByStationId: (stationId, options, callback) => {
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
	
				return yield v2Req.get({
					headers : headers,
					pathname : `/v2/stations/${stationId}/broadcasts`,
					query : options
				});
			});
	
			return validation.promiseOrCallback(exec, callback);
		},
		getBroadcast: (stationId, broadcastId, options, callback) => {
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
	
				return yield v2Req.get({
					headers : headers,
					pathname : `/v2/stations/${stationId}/broadcasts/${broadcastId}`,
					query : options
				});
			});
	
			return validation.promiseOrCallback(exec, callback);
		},
		getCollection: (collectionId, options, callback) => {
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
	
				return yield v2Req.get({
					headers : headers,
					pathname : `/v2/collections/${collectionId}`,
					query : options
				});
			});
	
			return validation.promiseOrCallback(exec, callback);
		},
		getPlaylist: (playlistId, options, callback) => {
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
	
				return yield v2Req.get({
					headers : headers,
					pathname : `/v2/playlists/${playlistId}`,
					query : options
				});
			});
	
			return validation.promiseOrCallback(exec, callback);
		},
		getStation: (stationId, options, callback) => {
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
	
				return yield v2Req.get({
					headers : headers,
					pathname : `/v2/stations/${stationId}`,
					query : options
				});
			});
	
			return validation.promiseOrCallback(exec, callback);
		},
		getTrack: (trackAlias, options, callback) => {
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
	
				return yield v2Req.get({
					headers : headers,
					pathname : `/v2/tracks/${trackAlias}`,
					query : options
				});
			});
	
			return validation.promiseOrCallback(exec, callback);
		},
		getTracks: (tracks, options, callback) => {
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
	
				return yield v2Req.post({
					headers : headers,
					pathname : '/v2/tracks/trackIds',
					query : options
				}, tracks);
			});
	
			return validation.promiseOrCallback(exec, callback);
		},
		mixCollection: (collectionId, options, callback) => {
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
	
				return yield v2Req.get({
					headers : headers,
					pathname : `/v2/collections/${collectionId}/mix`,
					query : options
				});
			});
	
			return validation.promiseOrCallback(exec, callback);
		},
		updateBroadcast: (stationId, broadcast, callback) => {
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
	
				return yield v2Req.put({
					headers : headers,
					pathname : `/v2/stations/${stationId}/broadcasts`
				}, broadcast);
			});
	
			return validation.promiseOrCallback(exec, callback);
		},
		updatePlaylist: (playlist, callback) => {
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
	
				return yield v2Req.put({
					headers : headers,
					pathname : `/v2/playlists/${playlist.playlistId}`
				}, playlist);
			});
	
			return validation.promiseOrCallback(exec, callback);
		},
		upsertCollections: (collections, callback) => {
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
	
				return yield v2Req.put({
					headers : headers,
					pathname : '/v2/collections'
				}, collections);
			});
	
			return validation.promiseOrCallback(exec, callback);
		},
		upsertStations: (stations, callback) => {
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
	
				return yield v2Req.put({
					headers : headers,
					pathname : '/v2/stations'
				}, stations);
			});
	
			return validation.promiseOrCallback(exec, callback);
		},
		version: (callback) => {
			let exec = co(function *() {
				return yield v2Req.get({
					pathname : '/v2/version'
				});
			});
	
			return validation.promiseOrCallback(exec, callback);
		}
	};

	self.versionCollection = (callback) => {
		let exec = co(function *() {
			return yield collectionReq.get({
				pathname : '/v3/version'
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.versionStation = (callback) => {
		let exec = co(function *() {
			return yield stationReq.get({
				pathname : '/v3/version'
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.versionTrack = (callback) => {
		let exec = co(function *() {
			return yield trackReq.get({
				pathname : '/v3/version'
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	return self;
};
