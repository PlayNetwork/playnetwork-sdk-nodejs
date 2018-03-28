var
	events = require('events'),

	co = require('co'),

	request = require('./request'),
	validation = require('./validation');

const
	DEFAULT_HOST = 'develop-assetapi.scaffold-workers-ext-main-us.d.cld.octavelive.com',
	DEFAULT_SECURE = true,
	EVENT_ERROR = 'error',
	EVENT_REQUEST = 'request',
	EVENT_RESPONSE = 'response',
	STATUS_CODE_NOT_FOUND = 404,
	STATUS_CODE_SUCCESS = 200;

module.exports = function (assetOptions, ensureAuthHeaders, self) {
	'use strict';

	// enable events
	self = Object.create(events.EventEmitter.prototype);
	events.EventEmitter.call(self);

	// local vars
	let
		req,
		settings = {};

	// determine settings
	settings.host =
		validation.isEmpty(assetOptions) || validation.isEmpty(assetOptions.host) ?
			DEFAULT_HOST :
			assetOptions.host;

	settings.secure =
		validation.isEmpty(assetOptions) || validation.isEmpty(assetOptions.secure) ?
			DEFAULT_SECURE :
			assetOptions.secure;

	// apply additional optional settings if supplied
	settings = validation.applyOptionalParameters(assetOptions, settings);

	// ensure request is setup
	req = new request.Request(settings);
	req.on(EVENT_REQUEST, (data) => (self.emit(EVENT_REQUEST, data)));
	req.on(EVENT_RESPONSE, (data) => (self.emit(EVENT_RESPONSE, data)));

	function buildAssetAlias (asset) {
		let parts = [];

		if (typeof asset === 'string') {
			return asset;
		}

		if (!validation.isEmpty(asset.collectionId)) {
			return `collectionid:${asset.collectionId}`;
		}

		if (!validation.isEmpty(asset.isrc)) {
			parts.push(...['isrc', asset.isrc]);
		}

		if (!validation.isEmpty(asset.upc)) {
			parts.push(...['upc', asset.upc]);
		}

		return join.parts(':');
	}

	self.call = (options, callback) => {
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(options)) {
				return yield Promise.reject(new Error('options are required'));
			}

			if (validation.isEmpty(options.pathname)) {
				return yield Promise.reject(new Error('options.pathname is required'));
			}

			if (validation.isEmpty(options.method) || typeof options.method !== 'string') {
				options.method = 'get';
			} else {
				options.method = options.method.toLowerCase();
			}

			let headers = yield ensureAuthHeaders(options);

			return yield req[options.method]({
				headers : headers,
				pathname : options.pathname
			}, options.data);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.checkOriginal = (originalId, callback) => {
		// handle any non-specified input params
		if (typeof originalId === 'function') {
			callback = originalId;
			originalId = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(originalId)) {
				return Promise.reject(new Error('originalId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.head({
				headers : headers,
				pathname : `/v1/originals/${originalId}`
			})
			.then((resp) => {
				return Promise.resolve(true)
			})
			.catch((err) => {
				if (err.statusCode && err.statusCode === STATUS_CODE_NOT_FOUND) {
					return Promise.resolve(false);
				}

				return Promise.reject(err);
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.createOriginal = (original, callback) => {
		// handle any non-specified input params
		if (typeof original === 'function') {
			callback = original;
			original = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(original)) {
				return yield Promise.reject(new Error('original is required'));
			}

			if (validation.isEmpty(original.originalId)) {
				return yield Promise.reject(new Error('originalId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.post({
				headers : headers,
				pathname : '/v1/originals'
			}, original);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getAssetStream = (asset, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof asset === 'function') {
			callback = asset;
			asset = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(asset)) {
				return yield Promise.reject(new Error('asset is required'));
			}

			let
				assetId = typeof asset === 'string' ? asset : asset.assetId,
				headers = yield ensureAuthHeaders(options);

			return yield req.get({
				headers : headers,
				pathname : `/v1/assets/${buildAssetAlias(asset)}`,
				query : options,
				rawStream : true
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.updateOriginal = (original, callback) => {
		// handle any non-specified input params
		if (typeof original === 'function') {
			callback = original;
			original = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(original)) {
				return yield Promise.reject(new Error('original is required'));
			}

			if (validation.isEmpty(original.originalId)) {
				return yield Promise.reject(new Error('originalId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.put({
				headers : headers,
				pathname : `/v1/originals/${original.originalId}`
			}, original);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.upsertAssets = (assets, callback) => {
		// handle any non-specified input params
		if (typeof assets === 'function') {
			callback = assets;
			assets = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(assets)) {
				return yield Promise.reject(new Error('assets are required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.put({
				headers : headers,
				pathname : '/v1/assets'
			}, assets);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.settings = () => (settings);

	self.version = (callback) => {
		let exec = co(function *() {
			return yield req.get({
				pathname : '/v1/version'
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	return self;
};