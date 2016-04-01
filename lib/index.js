var
	ClaimProxy = require('./claim'),
	ContentProxy = require('./content'),
	DeviceProxy = require('./device'),
	KeyProxy = require('./key'),
	MusicProxy = require('./music'),
	PlaybackProxy = require('./playback'),
	SettingsProxy = require('./settings'),
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
		ensureAuthHeaders = function () {
			return new Promise((resolve, reject) => {
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
		}

		// construct each PlayNetwork API proxy
		self.claim = new ClaimProxy(options.claim, ensureAuthHeaders);
		self.content = new ContentProxy(options.content, ensureAuthHeaders);
		self.device = new DeviceProxy(options.device, ensureAuthHeaders);
		self.key = key;
		self.music = new MusicProxy(options.music, ensureAuthHeaders);
		self.playback = new PlaybackProxy(options.playback, ensureAuthHeaders);
		self.settings = new SettingsProxy(options.settings, ensureAuthHeaders);

		// create a mechanism to retrieve configured options
		self.options = () => ({
			claim : self.claim.settings(),
			content : self.content.settings(),
			device : self.device.settings(),
			music : self.music.settings(),
			playback : self.playback.settings(),
			settings : self.settings.settings()
		});
	};

	return self;
}({}));
