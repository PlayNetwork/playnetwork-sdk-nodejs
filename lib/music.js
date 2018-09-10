var
	events = require('events'),

	co = require('co'),

	request = require('./request'),
	validation = require('./validation');

const
	DEFAULT_COLLECTION_HOST = 'master-collectionapi.scaffold-workers-ext-main-us.m.cld.octavelive.com',
	DEFAULT_STATION_HOST = 'MOCK_STATION_API_HOST',
	DEFAULT_TRACK_HOST = 'master-trackapi.scaffold-workers-ext-main-us.m.cld.octavelive.com',
	DEFAULT_SECURE = true,
	EVENT_ERROR = 'error',
	EVENT_REQUEST = 'request',
	EVENT_RESPONSE = 'response',
	STATUS_CODE_NOT_FOUND = 404,
	STATUS_CODE_SUCCESS = 200;

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
			track : {}
		},
		stationReq,
		trackReq;

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

	// apply additional optional settings if supplied
	if (!validation.isEmpty(musicOptions)) {
		settings.collection = validation.applyOptionalParameters(musicOptions.collection, settings.collection);
		settings.station = validation.applyOptionalParameters(musicOptions.station, settings.station);
		settings.track = validation.applyOptionalParameters(musicOptions.track, settings.track);
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

/*
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
	};*/

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

/*
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

	// self.callStation

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

/*
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
	};*/

/*
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
	};*/

/*
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

			let headers = yield ensureAuthHeaders(options);

			return yield stationReq.get({
				headers : headers,
				pathname : `/v3/stations/${stationId}/broadcasts`,
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

			let headers = yield ensureAuthHeaders(options);

			return yield stationReq.get({
				headers : headers,
				pathname : `/v3/stations/${stationId}/broadcasts/${broadcastId}`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};*/

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

			// mock station for testing broadcast-svc with v3 collections
			let mockStation = {
				legacy : {
					channelToken : 0,
					conceptName : 'Mock Concept',
					contentUpdateToken : 0,
					playlistToken: 0,
					version : '3'
				},
				scheduledCollections : [
					{
						allowInSchedule: true,
						allowUserSelection: true,
						beginDate : '1970-01-01T00:00:00.000Z',
						collectionId : '597faba7d7ff47d7a7c74eaf2cb00be8',
						endDate : '2999-12-31T00:00:00.000Z',
						podding : {
							absolute : 0,
							desired : 0
						},
						randomMix : true,
						separation : {
							matchingArtistThreshold : 5,
							matchingTitleThreshold : 5,
							otherCollectionDurationThreshold : 0,
							otherCollectionTrackThreshold : 0,
							otherTrackThreshold : 0
						},
						scheduledDays : [
							{
								day : 0,
								duration : 1440,
								startOffset : 0
							},
							{
								day : 1,
								duration : 1440,
								startOffset : 0
							},
							{
								day : 2,
								duration : 1440,
								startOffset : 0
							},
							{
								day : 3,
								duration : 1440,
								startOffset : 0
							},
							{
								day : 4,
								duration : 1440,
								startOffset : 0
							},
							{
								day : 5,
								duration : 1440,
								startOffset : 0
							},
							{
								day : 6,
								duration : 1440,
								startOffset : 0
							}
						]
					},
					{
						allowInSchedule: true,
						allowUserSelection: true,
						beginDate : '1970-01-01T00:00:00.000Z',
						collectionId : 'd6689f1fb70d445aa8f138fa6b6555aa',
						endDate : '2999-12-31T00:00:00.000Z',
						podding : {
							absolute : 0,
							desired : 0
						},
						randomMix : true,
						separation : {
							matchingArtistThreshold : 5,
							matchingTitleThreshold : 5,
							otherCollectionDurationThreshold : 0,
							otherCollectionTrackThreshold : 0,
							otherTrackThreshold : 0
						},
						scheduledDays : [
							{
								day : 0,
								duration : 15,
								startOffset : 930
							},
							{
								day : 1,
								duration : 15,
								startOffset : 930
							},
							{
								day : 2,
								duration : 15,
								startOffset : 930
							},
							{
								day : 3,
								duration : 15,
								startOffset : 930
							},
							{
								day : 4,
								duration : 15,
								startOffset : 930
							},
							{
								day : 5,
								duration : 15,
								startOffset : 930
							},
							{
								day : 6,
								duration : 15,
								startOffset : 930
							}
						]
					},
					{
						allowInSchedule: true,
						allowUserSelection: true,
						beginDate : '1970-01-01T00:00:00.000Z',
						collectionId : '79f34bcb476549658cf4ea81233ee69a',
						endDate : '2999-12-31T00:00:00.000Z',
						podding : {
							absolute : 0,
							desired : 0
						},
						randomMix : true,
						separation : {
							matchingArtistThreshold : 5,
							matchingTitleThreshold : 5,
							otherCollectionDurationThreshold : 0,
							otherCollectionTrackThreshold : 0,
							otherTrackThreshold : 0
						},
						scheduledDays : [
							{
								day : 0,
								duration : 15,
								startOffset : 930
							},
							{
								day : 1,
								duration : 15,
								startOffset : 930
							},
							{
								day : 2,
								duration : 15,
								startOffset : 930
							},
							{
								day : 3,
								duration : 15,
								startOffset : 930
							},
							{
								day : 4,
								duration : 15,
								startOffset : 930
							},
							{
								day : 5,
								duration : 15,
								startOffset : 930
							},
							{
								day : 6,
								duration : 15,
								startOffset : 930
							}
						]
					}
				],
				stationId : '12345',
				title : 'Mock Station',
				version : '3'
			};
			/*
			let headers = yield ensureAuthHeaders(options);

			return yield stationReq.get({
				headers : headers,
				pathname : `/v3/stations/${stationId}`,
				query : options
			});*/

			return yield Promise.resolve(mockStation);
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

/*
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

			return yield stationReq.put({
				headers : headers,
				pathname : `/v3/stations/${stationId}/broadcasts`
			}, broadcast);
		});

		return validation.promiseOrCallback(exec, callback);
	};*/

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

	self.versionCollection = (callback) => {
		let exec = co(function *() {
			return yield collectionReq.get({
				pathname : '/v3/version'
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

/*
	self.versionStation = (callback) => {
		let exec = co(function *() {
			return yield stationReq.get({
				pathname : '/v3/version'
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};*/

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
