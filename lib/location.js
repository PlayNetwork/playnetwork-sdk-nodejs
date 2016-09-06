var
	events = require('events'),

	co = require('co'),

	request = require('./request'),
	validation = require('./validation');

const
	DEFAULT_HOST = 'location-api.apps.playnetwork.com',
	DEFAULT_SECURE = true,
	EVENT_REQUEST = 'request',
	EVENT_RESPONSE = 'response';


module.exports = function (locationOptions, ensureAuthHeaders, self) {
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
		validation.isEmpty(locationOptions) || validation.isEmpty(locationOptions.host) ?
			DEFAULT_HOST :
			locationOptions.host;

	settings.secure =
		validation.isEmpty(locationOptions) || validation.isEmpty(locationOptions.secure) ?
			DEFAULT_SECURE :
			locationOptions.secure;

	// apply additional optional settings if supplied
	settings = validation.applyOptionalParameters(locationOptions, settings);

	// ensure request is setup
	req = new request.Request(settings);
	req.on(EVENT_REQUEST, (data) => (self.emit(EVENT_REQUEST, data)));
	req.on(EVENT_RESPONSE, (data) => (self.emit(EVENT_RESPONSE, data)));

	self.allAccountLocations = (options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		let exec = co(function *() {
			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : '/v0/locations/accounts',
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.allLocations = (options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		let exec = co(function *() {
			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : '/v0/locations',
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.allPhysicalLocations = (options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		let exec = co(function *() {
			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : '/v0/locations/physical',
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

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

			let headers = yield ensureAuthHeaders();

			return yield req[options.method]({
				headers : headers,
				pathname : options.pathname
			}, options.data);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getLocation = (locationId, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof locationId === 'function') {
			callback = locationId;
			locationId = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(locationId)) {
				return yield Promise.reject(new Error('locationId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : `/v0/locations/${locationId}`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getLocations = (locationIdList, callback) => {
		// handle any non-specified input params
		if (typeof locationIdList === 'function') {
			callback = locationIdList;
			locationIdList = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(locationIdList)) {
				return yield Promise.reject(new Error('locationIdList is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.post({
				headers : headers,
				pathname : '/v0/locations/locationIds'
			}, locationIdList);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getPhysicalLocation = (physicalLocationId, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof physicalLocationId === 'function') {
			callback = physicalLocationId;
			physicalLocationId = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(physicalLocationId)) {
				return yield Promise.reject(new Error('physicalLocationId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : `/v0/locations/physical/${physicalLocationId}`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

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
