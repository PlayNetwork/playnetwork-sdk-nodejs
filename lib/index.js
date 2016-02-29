var
	ContentProxy = require('./content'),
	KeyProxy = require('./key'),
	MusicProxy = require('./music'),
	PlaybackProxy = require('./playback'),
	validation = require('./validation');


module.exports = (function (self) {
	'use strict';

	self.configure = (clientId, secret, options) => {
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
			key = new KeyProxy(options.key);

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
		self.content = new ContentProxy(options.content, ensureAuthHeaders);
		self.music = new MusicProxy(options.music, ensureAuthHeaders);
		self.playback = new PlaybackProxy(options.playback, ensureAuthHeaders);
	};

	return self;
}({}));
