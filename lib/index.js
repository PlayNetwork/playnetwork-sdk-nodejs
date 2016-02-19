var
	events = require('events'),

	KeyProxy = require('./key'),
	MusicProxy = require('./music'),
	validation = require('./validation');


module.exports = function (clientId, secret, options, self) {
	'use strict';

	// enable events
	self = Object.create(events.EventEmitter.prototype);
	events.EventEmitter.call(self);

	// ensure clientId is provided
	if (validation.isEmpty(clientId)) {
		throw new Error('clientId is required');
	}

	// ensure secret is provided
	if (validation.isEmpty(secret)) {
		throw new Error('secret is required');
	}

	// default options if necessary
	if (validation.isEmpty(options)) {
		options = {};
	}

	let
		ensureAuthHeaders,
		key = new KeyProxy(options);

	// a promise for retrieving authentication headers
	ensureAuthHeaders = new Promise((resolve, reject) => {
		return key
			.generateToken(clientId, secret)
			.then((token) => {
				return resolve({
					'x-client-id': token.clientId,
					'x-authentication-token': token.tokenId
				});
			})
			.catch(reject);
	});

	// construct each PlayNetwork API proxy
	self.music = new MusicProxy(options, ensureAuthHeaders);

	return self;
};
