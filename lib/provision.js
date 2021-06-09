var
	events = require('events'),

	co = require('co'),

	request = require('./request'),
	validation = require('./validation'),
	hosts = require('./hosts');

const
	DEFAULT_HOST = hosts.PROVISION_API,
	DEFAULT_SECURE = true,
	EVENT_ERROR = 'error',
	EVENT_REQUEST = 'request',
	EVENT_RESPONSE = 'response',
	STATUS_CODE_NOT_FOUND = 404,
	STATUS_CODE_SUCCESS = 200;

module.exports = function (provisionOptions, ensureAuthHeaders, self) {
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
		validation.isEmpty(provisionOptions) || validation.isEmpty(provisionOptions.host) ?
			DEFAULT_HOST :
			provisionOptions.host;

	settings.secure =
		validation.isEmpty(provisionOptions) || validation.isEmpty(provisionOptions.secure) ?
			DEFAULT_SECURE :
			provisionOptions.secure;

	// apply additional optional settings if supplied
	settings = validation.applyOptionalParameters(provisionOptions, settings);

	// ensure request is setup
	req = new request.Request(settings);
	req.on(EVENT_REQUEST, (data) => (self.emit(EVENT_REQUEST, data)));
	req.on(EVENT_RESPONSE, (data) => (self.emit(EVENT_RESPONSE, data)));

	self.allApplications = (options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		let exec = co(function *() {

			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : '/v2/applications',
				query : options,
				rawStream : true
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.allOrders = (options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		let exec = co(function *() {
			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : '/v2/orders',
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.allDevices = (options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		let exec = co(function *() {
			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : '/v2/devices',
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

	self.checkUpdate = (options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		let exec = co(function *() {

			let headers = yield ensureAuthHeaders();

			return yield req.head({
				headers : headers,
				pathname : '/v2/applications',
				query : options,
				rawStream : true
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.createDevice = (device, callback) => {
		// handle any non-specified input params
		if (typeof device === 'function') {
			callback = device;
			device = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(device)) {
				return yield Promise.reject(new Error('device is required'));
			}

			if (validation.isEmpty(device.deviceId)) {
				return yield Promise.reject(new Error('deviceId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.post({
				headers : headers,
				pathname : '/v2/devices'
			}, device);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.createOrder = (order, callback) => {
		// handle any non-specified input params
		if (typeof order === 'function') {
			callback = order;
			order = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(order)) {
				return yield Promise.reject(new Error('order is required'));
			}

			if (validation.isEmpty(order.packingSlipId)) {
				return yield Promise.reject(new Error('packingSlipId is required'));
			}

			if (validation.isEmpty(order.identityMap)) {
				return yield Promise.reject(new Error('identityMap is required'));
			}

			if (validation.isEmpty(order.identityMap.dsiToken)) {
				return yield Promise.reject(new Error('dsiToken is required'));
			}

			if (validation.isEmpty(order.shipToAddress) && validation.isEmpty(order.stations)) {
				return yield Promise.reject(new Error('either shipToAddress or stations is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.post({
				headers : headers,
				pathname : '/v2/orders'
			}, order);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.createProfile = ({ clientId, profile }, callback) => {
		// handle any non-specified input params
		if (typeof profile === 'function') {
			callback = profile;
			profile = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(profile)) {
				return yield Promise.reject(new Error('profile is required'));
			}

			if (validation.isEmpty(clientId)) {
				return yield Promise.reject(new Error('clientId is required'));
			}

			if (validation.isEmpty(profile.applications)) {
				return yield Promise.reject(new Error('applications are required'));
			}

			if (validation.isEmpty(profile.template)) {
				return yield Promise.reject(new Error('template is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.post({
				headers : headers,
				pathname : '/v2/profiles'
			}, {
				clientId,
				profile
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getClientCredentials = (deviceId, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(deviceId)) {
				return yield Promise.reject(new Error('deviceId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : ['/v2/devices/', deviceId.replace(/\:/g, ''), '/activation'].join(''),
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getDevice = (deviceId, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof deviceId === 'function') {
			callback = deviceId;
			deviceId = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(deviceId)) {
				return yield Promise.reject(new Error('deviceId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : `/v2/devices/${deviceId}`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getOrder = (orderId, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof orderId === 'function') {
			callback = orderId;
			orderId = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(orderId)) {
				return yield Promise.reject(new Error('orderId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : `/v2/orders/${orderId}`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getProfile = (profileAlias, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof profileAlias === 'function') {
			callback = profileAlias;
			profileAlias = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			let headers = yield ensureAuthHeaders();

			if (validation.isEmpty(profileAlias)) {
				const clientId = headers[CLIENT_ID];
				profileAlias = `clientId:${clientId}`;
			}

			return yield req.get({
				headers : headers,
				pathname : `/v2/profiles/${profileAlias}`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.orderAction = (orderId, action, callback) => {
		// handle any non-specified input params
		if (typeof action === 'function') {
			callback = action;
			action = undefined;
		}

		if (typeof orderId === 'function') {
			callback = orderId;
			orderId = undefined;
			action = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(orderId)) {
				return yield Promise.reject(new Error('orderId is required'));
			}

			if (validation.isEmpty(action)) {
				return yield Promise.reject(new Error('action is required'));
			}

			let headers = yield ensureAuthHeaders();
			headers['Content-Type'] = 'application/json';

			return yield req.post({
				headers : headers,
				pathname : `/v2/orders/${orderId}/actions`,
				rawStream: true
			}, {
				action: action
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.settings = () => (settings);

	self.updateDevice = (device, callback) => {
		// handle any non-specified input params
		if (typeof device === 'function') {
			callback = device;
			device = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(device)) {
				return yield Promise.reject(new Error('device is required'));
			}

			if (validation.isEmpty(device.deviceId)) {
				return yield Promise.reject(new Error('deviceId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.put({
				headers : headers,
				pathname : `/v2/devices/${device.deviceId}`
			}, device);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.updateOrder = (order, callback) => {
		// handle any non-specified input params
		if (typeof order === 'function') {
			callback = order;
			order = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(order)) {
				return yield Promise.reject(new Error('order is required'));
			}

			if (validation.isEmpty(order.orderId)) {
				return yield Promise.reject(new Error('orderId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.put({
				headers : headers,
				pathname : `/v2/orders/${order.orderId}`
			}, order);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.updateProfile = (profileAlias, profile, callback) => {
		// handle any non-specified input params
		if (typeof profile === 'function') {
			callback = profile;
			profile = undefined;
		}

		if (typeof profileAlias === 'object') {
			profile = profileAlias;
			profileAlias = undefined;
		}

		if (typeof profileAlias === 'function') {
			callback = profileAlias;
			profileAlias = undefined;
			profile = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(profile)) {
				return yield Promise.reject(new Error('profile is required'));
			}

			if (validation.isEmpty(profileAlias)) {
				profileAlias = profile.profileId
			}

			if (validation.isEmpty(profileAlias)) {
				return yield Promise.reject(new Error('profileAlias is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.put({
				headers : headers,
				pathname : `/v2/profiles/${profileAlias}`
			}, profile);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.version = (callback) => {
		let exec = co(function *() {
			return yield req.get({
				pathname : '/v2/version'
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	return self;
};
