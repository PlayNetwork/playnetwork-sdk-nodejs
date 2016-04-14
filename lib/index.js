var
	fs = require('fs'),
	path = require('path'),

	ClaimProxy = require('./claim'),
	ContentProxy = require('./content'),
	DeviceProxy = require('./device'),
	KeyProxy = require('./key'),
	MusicProxy = require('./music'),
	PlaybackProxy = require('./playback'),
	SettingsProxy = require('./settings'),
	validation = require('./validation');

const DEFAULT_CREDENTIALS_PATH = '.playnetwork/credentials.json';

module.exports = (function (self) {
	'use strict';

	function loadSharedCredentials (options) {
		return new Promise((resolve, reject) => {
			let
				credentialsData = [],
				credentialsPath = options.credentialsPath ||
					path.join(
						(process.env.HOME || process.env.USERPROFILE),
						DEFAULT_CREDENTIALS_PATH),
				credentialsRead = fs.createReadStream(credentialsPath);

			credentialsRead.on('data', (chunk) => (credentialsData.push(chunk)));

			credentialsRead.on('end', () => {
				return resolve(JSON.parse(credentialsData.join('')));
			});

			credentialsRead.on('error', (err) => {
				err.path = credentialsPath;

				return reject(err);
			});
		});
	}

	self.configure = (clientId, secret, options) => {
		// handle scenario when options are supplied as first argument
		if (validation.isEmpty(options) && validation.isEmpty(secret)) {
			options = clientId;
			clientId = undefined;
		}

		// default options if necessary
		if (validation.isEmpty(options)) {
			options = {};
		}

		let
			ensureAuthHeaders,
			key = new KeyProxy(options.key),
			load = loadSharedCredentials(options);

		// a promise for retrieving authentication headers
		ensureAuthHeaders = function () {
			return new Promise((resolve, reject) => {
				let generateToken = () => {
					// ensure clientId is provided
					if (validation.isEmpty(clientId)) {
						throw new Error('clientId is required');
					}

					// ensure secret is provided
					if (validation.isEmpty(secret)) {
						throw new Error('secret is required');
					}

					return key
						.generateToken(clientId, secret)
						.then((token) => {
							return resolve({
								'x-client-id': token.clientId,
								'x-authentication-token': token.tokenId
							});
						})
						.catch(reject);
				};

				if (validation.isEmpty(clientId) || validation.isEmpty(secret)) {
					return load
						.then((credentials) => {
							clientId = credentials.clientId;
							secret = credentials.secret;

							return generateToken();
						})
						.catch(reject);
				}

				return generateToken();
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
