var
	events = require('events'),
	https = require('https'),

	co = require('co'),

	request = require('./request'),
	validation = require('./validation');

const
	DEFAULT_HOST = 'content-api.apps.playnetwork.com',
	DEFAULT_SECURE = true,
	EVENT_ERROR = 'error',
	EVENT_REDIRECT = 'redirect',
	EVENT_REQUEST = 'request',
	EVENT_RESPONSE = 'response',
	STATUS_CODE_SUCCESS = 200,
	TRACK_TOKEN_ALIAS_PREFIX = 'trackToken';


module.exports = function (contentOptions, ensureAuthHeaders, self) {
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
		validation.isEmpty(contentOptions) || validation.isEmpty(contentOptions.host) ?
			DEFAULT_HOST :
			contentOptions.host;

	settings.secure =
		validation.isEmpty(contentOptions) || validation.isEmpty(contentOptions.secure) ?
			DEFAULT_SECURE :
			contentOptions.secure;

	// apply additional optional settings if supplied
	settings = validation.applyOptionalParameters(contentOptions, settings);

	// ensure request is setup
	req = new request.Request(settings);
	req.on(EVENT_REDIRECT, (data) => (self.emit(EVENT_REDIRECT, data)));
	req.on(EVENT_REQUEST, (data) => (self.emit(EVENT_REQUEST, data)));
	req.on(EVENT_RESPONSE, (data) => (self.emit(EVENT_RESPONSE, data)));

	self.buildTrackAlias = (track) => {
		// if empty or a string and not a track token, return as assetId
		if (!track || (typeof track === 'string' && isNaN(track))) {
			return track;
		}

		// if a number is supplied, return as track token alias
		if (!isNaN(track)) {
			return [TRACK_TOKEN_ALIAS_PREFIX, track].join(':');
		}

		if (!validation.isEmpty(track.legacy) && !validation.isEmpty(track.legacy.trackToken)) {
			return [TRACK_TOKEN_ALIAS_PREFIX, track.legacy.trackToken].join(':');
		}

		return track.assetId;
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

	self.checkAsset = (track, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof track === 'function') {
			callback = track;
			track = undefined;
			options = undefined;
		}

		let redirectToLegacy =
			!validation.isEmpty(track) &&
			typeof track !== 'string' &&
			validation.isEmpty(track.assetId);

		// redirect to checkLegacyAsset if track does not have an assetId
		if (redirectToLegacy) {
			return self.checkLegacyAsset(track, options, callback);
		}

		let exec = new Promise((resolve, reject) => {
			let
				assetId,
				handleError = (err) => {
					req.removeListener(EVENT_ERROR, handleError);
					req.removeListener(EVENT_RESPONSE, handleResponse);

					return reject(err);
				},
				handleResponse = (result) => {
					req.removeListener(EVENT_ERROR, handleError);
					req.removeListener(EVENT_RESPONSE, handleResponse);

					return resolve(result.statusCode === STATUS_CODE_SUCCESS);
				};

			if (validation.isEmpty(track)) {
				return reject(new Error('track is required'));
			}

			assetId = typeof track === 'string' ? track : track.assetId;

			return ensureAuthHeaders()
				.then((headers) => {
					req.head({
						headers : headers,
						pathname : `/v0/assets/${assetId}`,
						query : options
					});

					req.on(EVENT_ERROR, handleError);
					req.on(EVENT_RESPONSE, handleResponse);
				})
				.catch(handleError);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.checkLegacyAsset = (track, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof track === 'function') {
			callback = track;
			track = undefined;
			options = undefined;
		}

		let exec = new Promise((resolve, reject) => {
			let
				alias,
				handleError = (err) => {
					req.removeListener(EVENT_ERROR, handleError);
					req.removeListener(EVENT_RESPONSE, handleResponse);

					return reject(err);
				},
				handleResponse = (result) => {
					req.removeListener(EVENT_ERROR, handleError);
					req.removeListener(EVENT_RESPONSE, handleResponse);

					return resolve(result.statusCode === STATUS_CODE_SUCCESS);
				};

			if (validation.isEmpty(track)) {
				return reject(new Error('track is required'));
			}

			alias = self.buildTrackAlias(track);

			if (validation.isEmpty(alias)) {
				return reject(new Error('track is missing identifier'));
			}

			return ensureAuthHeaders()
				.then((headers) => {
					req.head({
						headers : headers,
						pathname : `/v0/legacy/assets/${alias}`,
						query : options
					});

					req.on(EVENT_ERROR, handleError);
					req.on(EVENT_RESPONSE, handleResponse);
				})
				.catch(handleError);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.checkOriginalAsset = (track, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof track === 'function') {
			callback = track;
			track = undefined;
			options = undefined;
		}

		let redirectToLegacy =
			!validation.isEmpty(track) &&
			typeof track !== 'string' &&
			validation.isEmpty(track.assetId);

		// redirect to checkLegacyAsset if track does not have an assetId
		if (redirectToLegacy) {
			return self.checkLegacyAsset(track, options, callback);
		}

		let exec = new Promise((resolve, reject) => {
			let
				assetId,
				handleError = (err) => {
					req.removeListener(EVENT_ERROR, handleError);
					req.removeListener(EVENT_RESPONSE, handleResponse);

					return reject(err);
				},
				handleResponse = (result) => {
					req.removeListener(EVENT_ERROR, handleError);
					req.removeListener(EVENT_RESPONSE, handleResponse);

					return resolve(result.statusCode === STATUS_CODE_SUCCESS);
				};

			if (validation.isEmpty(track)) {
				return reject(new Error('track is required'));
			}

			assetId = typeof track === 'string' ? track : track.assetId;

			return ensureAuthHeaders()
				.then((headers) => {
					req.head({
						headers : headers,
						pathname : `/v0/originalassets/${assetId}`,
						query : options
					});

					req.on(EVENT_ERROR, handleError);
					req.on(EVENT_RESPONSE, handleResponse);
				})
				.catch(handleError);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getAssetStream = (track, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof track === 'function') {
			callback = track;
			track = undefined;
			options = undefined;
		}

		let redirectToLegacy =
			!validation.isEmpty(track) &&
			typeof track !== 'string' &&
			validation.isEmpty(track.assetId);

		// redirect to checkLegacyAsset if track does not have an assetId
		if (redirectToLegacy) {
			return self.getLegacyAssetStream(track, options, callback);
		}

		let exec = co(function *() {
			if (validation.isEmpty(track)) {
				return yield Promise.reject(new Error('track is required'));
			}

			let
				assetId = typeof track === 'string' ? track : track.assetId,
				headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : `/v0/assets/${assetId}`,
				query : options,
				rawStream : true
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getLegacyAssetStream = (track, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof track === 'function') {
			callback = track;
			track = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(track)) {
				return yield Promise.reject(new Error('track is required'));
			}

			let
				alias = self.buildTrackAlias(track),
				headers = yield ensureAuthHeaders();

			if (validation.isEmpty(alias)) {
				return yield Promise.reject(new Error('track is missing identifier'));
			}

			return yield req.get({
				headers : headers,
				pathname : `/v0/legacy/assets/${alias}`,
				query : options,
				rawStream : true
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getOriginalAssetStream = (track, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof track === 'function') {
			callback = track;
			track = undefined;
			options = undefined;
		}

		let redirectToLegacy =
			!validation.isEmpty(track) &&
			typeof track !== 'string' &&
			validation.isEmpty(track.assetId);

		// redirect to checkLegacyAsset if track does not have an assetId
		if (redirectToLegacy) {
			return self.getLegacyAssetStream(track, options, callback);
		}

		let exec = co(function *() {
			if (validation.isEmpty(track)) {
				return yield Promise.reject(new Error('track is required'));
			}

			let
				assetId = typeof track === 'string' ? track : track.assetId,
				headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : `/v0/originalassets/${assetId}`,
				query : options,
				rawStream : true
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.settings = () => (settings);

	self.version = (callback) => {
		let exec = co(function *() {
			return yield req.get({
				pathname : '/v0/version'
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	return self;
};
