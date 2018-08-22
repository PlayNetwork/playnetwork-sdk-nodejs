var
	events = require('events'),

	co = require('co'),

	request = require('./request'),
	validation = require('./validation');

const
	DEFAULT_HOST = 'master-trackapi.scaffold-workers-ext-main-us.m.cld.octavelive.com',
	DEFAULT_SECURE = true,
	EVENT_ERROR = 'error',
	EVENT_REQUEST = 'request',
	EVENT_RESPONSE = 'response',
	STATUS_CODE_NOT_FOUND = 404,
	STATUS_CODE_SUCCESS = 200,
	TRACK_APPLE_ID_PREFIX = 'appleId',
	TRACK_ID_PREFIX = 'trackId',
	TRACK_ISRC_PREFIX = 'isrc';

module.exports = function (trackOptions, ensureAuthHeaders, self) {
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
		validation.isEmpty(trackOptions) || validation.isEmpty(trackOptions.host) ?
			DEFAULT_HOST :
			trackOptions.host;

	settings.secure =
		validation.isEmpty(trackOptions) || validation.isEmpty(trackOptions.secure) ?
			DEFAULT_SECURE :
			trackOptions.secure;

	// apply additional optional settings if supplied
	settings = validation.applyOptionalParameters(trackOptions, settings);

	// ensure request is setup
	req = new request.Request(settings);
	req.on(EVENT_REQUEST, (data) => (self.emit(EVENT_REQUEST, data)));
	req.on(EVENT_RESPONSE, (data) => (self.emit(EVENT_RESPONSE, data)));

	self.allTracks = (options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		let exec = co(function *() {
			let headers = yield ensureAuthHeaders(options);

			return yield req.get({
				headers : headers,
				pathname : '/v3/tracks',
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

			return yield req.get({
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

			return yield req.post({
				headers : headers,
				pathname : '/v3/tracks/aliases',
				query : options
			}, tracks);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.settings = () => (settings);

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