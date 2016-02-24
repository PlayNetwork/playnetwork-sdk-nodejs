var
	events = require('events'),

	request = require('./request'),
	validation = require('./validation');

const
	DEFAULT_CACHE_TOKENS = true,
	DEFAULT_HOST = 'key-api.apps.playnetwork.com',
	DEFAULT_SECURE = true,
	EVENT_REQUEST = 'request',
	EVENT_RESPONSE = 'response';


module.exports = function (options, self) {
	'use strict';

	// enable events
	self = Object.create(events.EventEmitter.prototype);
	events.EventEmitter.call(self);

	// local vars
	let
		req,
		settings = JSON.parse(JSON.stringify(options || {}));

	settings.cacheTokens = validation.isEmpty(settings.cacheTokens) ?
		DEFAULT_CACHE_TOKENS :
		settings.cacheTokens;

	settings.host = validation.isEmpty(settings.keyHost) ?
		DEFAULT_HOST :
		settings.keyHost;

	settings.secure = validation.isEmpty(settings.keySecure) ?
		DEFAULT_SECURE :
		settings.keySecure;

	// ensure request is setup
	req = new request.Request(settings);
	req.on(EVENT_REQUEST, (data) => (self.emit(EVENT_REQUEST, data)));
	req.on(EVENT_RESPONSE, (data) => (self.emit(EVENT_RESPONSE, data)));

	let tokenMap = new Map();

	self.generateToken = (clientId, secret, callback) => {
		let exec = new Promise((resolve, reject) => {
			if (validation.isEmpty(clientId)) {
				return reject(new Error('clientId is required'));
			}

			if (validation.isEmpty(secret)) {
				return reject(new Error('secret is required'));
			}

			// determine if a valid token exists
			let token = tokenMap.get(clientId);

			if (token && token.expires >= new Date()) {
				return resolve(token);
			} else {
				// ensure the tokenMap is cleared for the specified clientId
				tokenMap.delete(clientId);
			}

			return req
				.post({
					headers : {
						'x-client-id' : clientId,
						'x-client-secret' : secret
					},
					path : '/v0/tokens'
				})
				.then((result) => {
					token = result.token;
					token.modified = undefined;
					token.created = undefined;
					token.expires = new Date(token.expires);

					if (settings.cacheTokens) {
						tokenMap.set(clientId, token);
					}

					return resolve(token);
				})
				.catch(reject);
		});

		// return the promise if no callback is specified
		if (validation.isEmpty(callback)) {
			return exec;
		}

		// support callback
		return exec
			.then((result) => (callback(null, result)))
			.catch((err) => (callback(err)));
	};

	self.getTokenCacheSize = () => (tokenMap.size);

	return self;
};
