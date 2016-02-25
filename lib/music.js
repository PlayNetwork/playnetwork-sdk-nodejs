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


module.exports = function (options, ensureAuthHeaders, self) {
	'use strict';

	// enable events
	self = Object.create(events.EventEmitter.prototype);
	events.EventEmitter.call(self);

	// local vars
	let
		req,
		settings = JSON.parse(JSON.stringify(options || {}));

	settings.host = validation.isEmpty(settings.musicHost) ?
		DEFAULT_HOST :
		settings.musicHost;

	settings.secure = validation.isEmpty(settings.musicSecure) ?
		DEFAULT_SECURE :
		settings.musicSecure;

	// ensure request is setup
	req = new request.Request(settings);
	req.on(EVENT_REQUEST, (data) => (self.emit(EVENT_REQUEST, data)));
	req.on(EVENT_RESPONSE, (data) => (self.emit(EVENT_RESPONSE, data)));

	self.allCollections = (query, callback) => {
		let exec = new Promise((resolve, reject) => {
			return co(function *() {
				let headers = yield ensureAuthHeaders;

				return yield req.get({
					headers : headers,
					pathname : '/v2/collections',
					query : query
				});
			}).then(resolve).catch(reject);
		});

		// query is optional
		if (typeof query === 'function') {
			callback = query;
			query = undefined;
		}

		// return the promise if no callback is specified
		if (validation.isEmpty(callback)) {
			return exec;
		}

		// support callback
		return exec
			.then((result) => (callback(null, result)))
			.catch((err) => (callback(err)));
	};

	return self;
};
