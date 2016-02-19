var
	Request = require('./request'),
	validation = require('./validation'),

	DEFAULT_CACHE_TOKENS = true,
	DEFAULT_HOST = 'key-api.apps.playnetwork.com',
	DEFAULT_SECURE = true;


module.exports = function (settings, request, self) {
	'use strict';

	// ensure options are properly set
	settings = settings || {};
	settings.cacheTokens = validation.isEmpty(settings.cacheTokens) ?
		DEFAULT_CACHE_TOKENS :
		settings.cacheTokens,
	settings.host = validation.isEmpty(settings.host) ?
		DEFAULT_HOST :
		settings.host,
	settings.secure = validation.isEmpty(settings.secure) ?
		DEFAULT_SECURE :
		settings.secure;

	// ensure request is set
	request = request || new Request(settings);

	// ensure self is set
	self = self || {};

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

			return request
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
