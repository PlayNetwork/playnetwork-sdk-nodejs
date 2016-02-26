var
	events = require('events'),

	co = require('co'),

	request = require('./request'),
	validation = require('./validation');

const
	DEFAULT_HOST = 'curio-music-api.apps.playnetwork.com',
	DEFAULT_SECURE = true,
	EVENT_REQUEST = 'request',
	EVENT_RESPONSE = 'response';


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

	self.allBroadcastsForStation = (stationId, query, callback) => {
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

	self.getBroadcastForStation = (broadcastId, stationId, query, callback) => {
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

		if (typeof broadcastId === 'function') {
			callback = broadcastId;
			broadcastId = undefined;
			stationId = undefined;
			query = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(broadcastId)) {
				throw new Error('broadcastId is required');
			}

			if (validation.isEmpty(stationId)) {
				throw new Error('stationId is required');
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
