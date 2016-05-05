var
	events = require('events'),

	co = require('co'),

	request = require('./request'),
	validation = require('./validation');

const
	DEFAULT_HOST = 'playback-api.apps.playnetwork.com',
	DEFAULT_SECURE = true,
	EVENT_REQUEST = 'request',
	EVENT_RESPONSE = 'response';


module.exports = function (playbackOptions, ensureAuthHeaders, self) {
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
		validation.isEmpty(playbackOptions) || validation.isEmpty(playbackOptions.host) ?
			DEFAULT_HOST :
			playbackOptions.host;

	settings.secure =
		validation.isEmpty(playbackOptions) || validation.isEmpty(playbackOptions.secure) ?
			DEFAULT_SECURE :
			playbackOptions.secure;

	// apply additional optional settings if supplied
	if (!validation.isEmpty(playbackOptions)) {
		if (!validation.isEmpty(playbackOptions.agent)) {
			settings.agent = playbackOptions.agent;
		}

		if (!validation.isEmpty(playbackOptions.maxRetries)) {
			settings.maxRetries = playbackOptions.maxRetries;
		}

		if (!validation.isEmpty(playbackOptions.port)) {
			settings.port = playbackOptions.port;
		}

		if (!validation.isEmpty(playbackOptions.rejectUnauthorized)) {
			settings.rejectUnauthorized = playbackOptions.rejectUnauthorized;
		}
	}

	// ensure request is setup
	req = new request.Request(settings);
	req.on(EVENT_REQUEST, (data) => (self.emit(EVENT_REQUEST, data)));
	req.on(EVENT_RESPONSE, (data) => (self.emit(EVENT_RESPONSE, data)));

	self.allPlays = (key, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof key === 'function') {
			callback = key;
			key = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(key)) {
				return yield Promise.reject(new Error('key is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : '/v1/plays',
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.recordPlay = (playback, callback) => {
		// handle any non-specified input params
		if (typeof playback === 'function') {
			callback = playback;
			playback = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(playback)) {
				return yield Promise.reject(new Error('playback data is required'));
			}

			if (validation.isEmpty(playback.content)) {
				return yield Promise.reject(new Error('content information is required'));
			}

			// ensure content identifier is set
			if (validation.isEmpty(playback.content.assetId) &&
				(validation.isEmpty(playback.content.legacy) ||
				validation.isEmpty(playback.content.legacy.trackToken))) {
				return yield Promise.reject(new Error('content identifier is required'));
			}

			// ensure device identifier is set
			if (validation.isEmpty(playback.deviceId) &&
				(validation.isEmpty(playback.legacy) ||
				validation.isEmpty(playback.legacy.deviceToken))) {
				return yield Promise.reject(new Error('device identifier is required'));
			}

			// ensure playback.created is set
			if (validation.isEmpty(playback.created)) {
				playback.created = new Date();
			}

			let headers = yield ensureAuthHeaders();

			return yield req.post({
				headers : headers,
				pathname : '/v1/plays'
			}, playback);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.settings = () => (settings);

	return self;
};
