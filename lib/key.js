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
	EVENT_DATA = 'data',
	EVENT_END = 'end',
	EVENT_ERROR = 'error',
	EVENT_REQUEST = 'request',
	EVENT_RESPONSE = 'response',
	STATUS_CODE_NOT_FOUND = 404,
	STATUS_CODE_SUCCESS = 200;


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
		validation.isEmpty(keyOptions) || typeof keyOptions.secure !== 'boolean' ?
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

	self.activate = (activationCode, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof activationCode === 'function') {
			callback = activationCode;
			activationCode = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(activationCode)) {
				return yield Promise.reject(new Error('activationCode is required'));
			}

			return yield req.post({
				pathname : `/v0/activations/${activationCode}/activate`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

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

	self.createClient = (client, callback) => {
		// handle any non-specified input params
		if (typeof client === 'function') {
			callback = client;
			client = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(client)) {
				return yield Promise.reject(new Error('client is required'));
			}

			if (validation.isEmpty(client.name)) {
				return yield Promise.reject(new Error('client name is required'));
			}

			let headers = yield self.ensureAuthHeaders();

			return yield req.post({
				headers : headers,
				pathname : '/v0/clients'
			}, client);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.disableClient = (clientId, callback) => {
		// handle any non-specified input params
		if (typeof clientId === 'function') {
			callback = clientId;
			clientId = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(clientId)) {
				return Promise.reject(new Error('clientId is required'));
			}

			let headers = yield self.ensureAuthHeaders();

			return yield req
				.delete({
					headers : headers,
					path : `/v0/clients/${clientId}`
				})
				.then((result) => {
					// remove client from internal token map
					tokenMap.delete(clientId);

					// resolve to caller
					return Promise.resolve();
				});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.ensureAuthHeaders = (options) => {
		options = options || {};

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

			// check to see if clientId and secret has been overridden on the request
			if (!validation.isEmpty(options.clientId) && !validation.isEmpty(options.secret)) {
				return self
					.generateToken(options.clientId, options.secret)
					.then((token) => {
						return resolve({
							'x-client-id': token.clientId,
							'x-authentication-token': token.tokenId
						});
					})
					.catch(reject);
			}

			// check to see if client or token is already present
			if (!validation.isEmpty(options.clientId)) {
				let headers = {
					'x-client-id': options.clientId
				};

				if (options.token) {
					headers['x-authentication-token'] = options.token;
				}

				return resolve(headers);
			}

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

			fileReader.on(EVENT_DATA, (chunk) => (data.push(chunk)));

			fileReader.on(EVENT_END, () => {
				let credentials = JSON.parse(data);
				clientId = credentials.clientId;
				secret = credentials.secret;

				return generateToken();
			});

			fileReader.on(EVENT_ERROR, (err) => {
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

	self.getClient = (clientId, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof clientId === 'function') {
			callback = clientId;
			clientId = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(clientId)) {
				return yield Promise.reject(new Error('clientId is required'));
			}

			let headers = yield self.ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : `/v0/clients/${clientId}`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getTokenCacheSize = () => (tokenMap.size);

	self.grantClientAccess = (clientId, serviceId, callback) => {
		let exec = co(function *() {
			if (validation.isEmpty(clientId)) {
				return yield Promise.reject(new Error('clientId is required'));
			}

			if (validation.isEmpty(serviceId)) {
				return yield Promise.reject(new Error('serviceId is required'));
			}

			let headers = yield self.ensureAuthHeaders();

			return yield req.post({
				headers : headers,
				pathname : `/v0/clients/${clientId}/services/${serviceId}`
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.purgeTokenCache = (clientId) => {
		if (validation.isEmpty(clientId)) {
			let success = tokenMap.size > 0;
			tokenMap.clear();
			return success;
		}

		return tokenMap.delete(clientId);
	};

	self.settings = () => (settings);

	self.updateClient = (clientId, client, callback) => {
		// handle any non-specified input params
		if (typeof client === 'function') {
			callback = client;
			client = undefined;
		}

		if (typeof clientId === 'function') {
			callback = clientId;
			clientId = undefined;
			client = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(clientId)) {
				return yield Promise.reject(new Error('clientId is required'));
			}

			if (validation.isEmpty(client)) {
				return yield Promise.reject(new Error('client details are required'));
			}

			let headers = yield self.ensureAuthHeaders();

			return yield req.put({
				headers : headers,
				pathname : `/v0/clients/${clientId}`
			}, client);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.validateClient = (clientId, serviceId, callback) => {
		let exec = new Promise((resolve, reject) => {
			if (validation.isEmpty(clientId)) {
				return reject(new Error('clientId is required'));
			}

			if (validation.isEmpty(serviceId)) {
				return reject(new Error('serviceId is required'));
			}

			// issue request
			req
				.head({
					headers : {
						'x-client-id' : clientId,
						'x-service-id' : serviceId
					},
					path : `/v0/clients/${clientId}`
				})
				.then(() => resolve(true))
				.catch((err) => {
					if (err.statusCode && err.statusCode === STATUS_CODE_NOT_FOUND) {
						return resolve(false);
					}

					return reject(err);
				});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.validateToken = (clientId, token, serviceId, callback) => {
		// handle any non-specified input params
		if (typeof serviceId === 'function') {
			callback = serviceId;
			serviceId = undefined;
		}

		let exec = new Promise((resolve, reject) => {
			if (validation.isEmpty(clientId)) {
				return reject(new Error('clientId is required'));
			}

			if (validation.isEmpty(token)) {
				return reject(new Error('token is required'));
			}

			// determine if a valid token exists if cacheTokens is enabled
			if (settings.cacheTokens) {
				let cachedToken = tokenMap.get(clientId);
				if (cachedToken && cachedToken.tokenId === (typeof token === 'string' ? token : token.tokenId)) {
					// ensure the cached token has not expired
					if (cachedToken.expires >= new Date()) {
						return resolve(true);
					}

					// ensure the tokenMap is cleared when the token has expired
					tokenMap.delete(clientId);
				}
			}

			let headers = {
				'x-client-id' : clientId
			};

			// add serviceId header if supplied
			if (!validation.isEmpty(serviceId)) {
				headers['x-service-id'] = serviceId;
			}

			// issue request
			return req
				.get({
					headers : headers,
					path : `/v0/tokens/${typeof token === 'string' ? token : token.tokenId}`
				})
				.then((result) => {
					token = validation.isEmpty(result.token) ? result : result.token;
					token.modified = undefined;
					token.created = undefined;
					token.expires = new Date(token.expires);

					if (settings.cacheTokens) {
						tokenMap.set(clientId, token);
					}

					return resolve(true);
				})
				.catch((err) => {
					if (validation.isEmpty(err.statusCode) || err.statusCode !== STATUS_CODE_NOT_FOUND) {
						return reject(err);
					}

					return resolve(false);
				});
		});

		return validation.promiseOrCallback(exec, callback);
	};

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
