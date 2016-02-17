var
	Request = require('./request'),
	validation = require('./validation'),

	DEFAULT_HOST = 'key-api.apps.playnetwork.com',
	DEFAULT_SECURE = true;


module.exports = function (settings, request, self) {
	'use strict';

	// ensure options are properly set
	settings = settings || {};
	settings.host = settings.host || DEFAULT_HOST;
	settings.secure = settings.secure || DEFAULT_SECURE;

	// ensure request is set
	request = request || new Request(settings);

	// ensure self is set
	self = self || {};

	self.generateToken = (clientId, secret, callback) => {
		let exec = new Promise((resolve, reject) => {
			if (validation.isEmpty(clientId)) {
				return reject(new Error('clientId is required'));
			}

			if (validation.isEmpty(secret)) {
				return reject(new Error('secret is required'));
			}

			return request
				.post({
					headers : {
						'x-client-id' : clientId,
						'x-client-secret' : secret
					},
					path : '/v0/tokens'
				})
				.then((result) => (resolve(result.token)))
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

	return self;
};
