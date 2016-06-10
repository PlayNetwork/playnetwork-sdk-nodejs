var
	events = require('events'),
	fs = require('fs'),
	path = require('path'),

	co = require('co'),

	request = require('./request'),
	validation = require('./validation');

const
	DEFAULT_CACHE_TOKENS = true,
	DEFAULT_CREDENTIALS_PATH = '.playnetwork/credentials.json',
	DEFAULT_HOST = 'key-api.apps.playnetwork.com',
	DEFAULT_SECURE = true,
	EVENT_REQUEST = 'request',
	EVENT_RESPONSE = 'response';


module.exports = function (keyOptions, clientId, secret, self) {
	'use strict';

	// enable events
	self = Object.create(events.EventEmitter.prototype);
	events.EventEmitter.call(self);

	// local vars
	let
		req,
		settings = {};

	// determine settings
	settings.cacheTokens =
		validation.isEmpty(keyOptions) || validation.isEmpty(keyOptions.cacheTokens) ?
			DEFAULT_CACHE_TOKENS :
			keyOptions.cacheTokens;

	settings.host =
		validation.isEmpty(keyOptions) || validation.isEmpty(keyOptions.host) ?
			DEFAULT_HOST :
			keyOptions.host;

	settings.secure =
		validation.isEmpty(keyOptions) || validation.isEmpty(keyOptions.secure) ?
			DEFAULT_SECURE :
			keyOptions.secure;

	// apply supplied credentials override path if applicable
	if (!validation.isEmpty(keyOptions) && !validation.isEmpty(keyOptions.credentialsPath)) {
		settings.credentialsPath = keyOptions.credentialsPath;
	}

	// apply additional optional settings if supplied
	settings = validation.applyOptionalParameters(keyOptions, settings);

	// ensure request is setup
	req = new request.Request(settings);
	req.on(EVENT_REQUEST, (data) => (self.emit(EVENT_REQUEST, data)));
	req.on(EVENT_RESPONSE, (data) => (self.emit(EVENT_RESPONSE, data)));

	let tokenMap = new Map();

	self.allClients = (options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		let exec = co(function *() {
			let headers = yield self.ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : '/v0/clients',
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.ensureAuthHeaders = () => {
		// a Promise for retrieving authentication headers
		return new Promise((resolve, reject) => {
			let
				data,
				filePath,
				fileReader,
				generateToken = () => {
					// ensure clientId is provided
					if (validation.isEmpty(clientId)) {
						return reject(new Error('clientId is required'));
					}

					// ensure secret is provided
					if (validation.isEmpty(secret)) {
						return reject(new Error('secret is required'));
					}

					return self
						.generateToken(clientId, secret)
						.then((token) => {
							return resolve({
								'x-client-id': token.clientId,
								'x-authentication-token': token.tokenId
							});
						})
						.catch(reject);
				};

			// determine if clientId and secret have been provided...
			if (!validation.isEmpty(clientId) && !validation.isEmpty(secret)) {
				return generateToken();
			}

			// read credentials from shared credentials file
			data = [];
			filePath = (
				settings.credentialsPath ||
				path.join(
					(process.env.HOME || process.env.USERPROFILE),
					DEFAULT_CREDENTIALS_PATH));
			fileReader = fs.createReadStream(filePath, { encoding : 'utf8' });

			fileReader.on('data', (chunk) => (data.push(chunk)));

			fileReader.on('end', () => {
				let credentials = JSON.parse(data);
				clientId = credentials.clientId;
				secret = credentials.secret;

				return generateToken();
			});

			fileReader.on('error', (err) => {
				err.path = filePath;

				return reject(err);
			});
		});
	};

	self.generateToken = (clientId, secret, callback) => {
		// handle any non-specified input params
		if (typeof secret === 'function') {
			callback = secret;
			secret = undefined;
		}

		if (typeof clientId === 'function') {
			callback = clientId;
			clientId = undefined;
			secret = undefined;
		}

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

		return validation.promiseOrCallback(exec, callback);
	};

	self.getTokenCacheSize = () => (tokenMap.size);

	self.settings = () => (settings);

	self.version = (callback) => {
		let exec = co(function *() {
			return yield req.get({
				pathname : '/v0/version'
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	return self;
};
