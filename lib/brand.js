var
	events = require('events'),

	co = require('co'),

	request = require('./request'),
	validation = require('./validation');

const
	DEFAULT_HOST = 'master-brandapi.scaffold-workers-main-us.m.cld.octavelive.com',
	DEFAULT_SECURE = true,
	EVENT_REQUEST = 'request',
	EVENT_RESPONSE = 'response';


module.exports = function (brandOptions, ensureAuthHeaders, self) {
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
		validation.isEmpty(brandOptions) || validation.isEmpty(brandOptions.host) ?
			DEFAULT_HOST :
			brandOptions.host;

	settings.secure =
		validation.isEmpty(brandOptions) || validation.isEmpty(brandOptions.secure) ?
			DEFAULT_SECURE :
			brandOptions.secure;

	// apply additional optional settings if supplied
	settings = validation.applyOptionalParameters(brandOptions, settings);

	// ensure request is setup
	req = new request.Request(settings);
	req.on(EVENT_REQUEST, (data) => (self.emit(EVENT_REQUEST, data)));
	req.on(EVENT_RESPONSE, (data) => (self.emit(EVENT_RESPONSE, data)));

	self.allBrands = (options, callback) => {
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		let exec = co(function *() {
			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : '/v1/brands',
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getBrand = (brandId, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof brandId === 'function') {
			callback = brandId;
			brandId = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(brandId)) {
				return yield Promise.reject(new Error('brandId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : `/v1/brands/${brandId}`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.allCurationGroups = (brandId, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof brandId === 'function') {
			callback = brandId;
			brandId = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(brandId)) {
				return yield Promise.reject(new Error('brandId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : `/v1/brands/${brandId}/curationGroups`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getCurationGroup = (brandId, curationGroupId, options, callback) => {
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof brandId === 'function') {
			callback = brandId;
			brandId = undefined;
			options = undefined;
		}

		if (typeof curationGroupId === 'function') {
			callback = curationGroupId;
			curationGroupId = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(brandId)) {
				return yield Promise.reject(new Error('brandId is required'));
			}

			if (validation.isEmpty(curationGroupId)) {
				return yield Promise.reject(new Error('curationGroupId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : `/v1/brands/${brandId}/curationGroups/${curationGroupId}`,
				query : options
			});
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
