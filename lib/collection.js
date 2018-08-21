var
	events = require('events'),

	co = require('co'),

	request = require('./request'),
	validation = require('./validation');

const
	DEFAULT_HOST = 'master-collectionapi.scaffold-workers-ext-main-us.m.cld.octavelive.com',
	DEFAULT_SECURE = true,
	EVENT_ERROR = 'error',
	EVENT_REQUEST = 'request',
	EVENT_RESPONSE = 'response',
	STATUS_CODE_NOT_FOUND = 404,
	STATUS_CODE_SUCCESS = 200;

module.exports = function (collectionOptions, ensureAuthHeaders, self) {
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
		validation.isEmpty(collectionOptions) || validation.isEmpty(collectionOptions.host) ?
			DEFAULT_HOST :
			collectionOptions.host;

	settings.secure =
		validation.isEmpty(collectionOptions) || validation.isEmpty(collectionOptions.secure) ?
			DEFAULT_SECURE :
			collectionOptions.secure;

	// apply additional optional settings if supplied
	settings = validation.applyOptionalParameters(collectionOptions, settings);

	// ensure request is setup
	req = new request.Request(settings);
	req.on(EVENT_REQUEST, (data) => (self.emit(EVENT_REQUEST, data)));
	req.on(EVENT_RESPONSE, (data) => (self.emit(EVENT_RESPONSE, data)));

	self.allCollections = (options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		let exec = co(function *() {
			let headers = yield ensureAuthHeaders(options);

			return yield req.get({
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

			return yield req.get({
				headers : headers,
				pathname : `/v3/collections/${collectionId}/tracks`,
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

			let headers = yield ensureAuthHeaders(options);

			return yield req[options.method]({
				headers : headers,
				pathname : options.pathname
			}, options.data);
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

			return yield req.get({
				headers : headers,
				pathname : `/v3/collections/${collectionId}`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.settings = () => (settings);

	self.upsertCollections = (collections, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
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

			return yield req.put({
				headers : headers,
				pathname : '/v3/collections'
			}, collections);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.version = (callback) => {
		let exec = co(function *() {
			return yield req.get({
				pathname : '/v3/version'
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	return self;
};