var
	events = require('events'),

	co = require('co'),

	request = require('./request'),
	validation = require('./validation');

const
	DEFAULT_HOST = 'provision-api.apps.playnetwork.com',
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

	self.allOrders = (options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		let exec = co(function *() {
			let headers = yield ensureAuthHeaders(options);

			return yield req.get({
				headers : headers,
				pathname : '/v2/orders',
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

			let headers = yield ensureAuthHeaders(options);

			return yield req[options.method]({
				headers : headers,
				pathname : options.pathname
			}, options.data);
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

	self.checkUpdate = (options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		let exec = co(function *() {

			let headers = yield ensureAuthHeaders(options);

			return yield req.head({
				headers : headers,
				pathname : '/v2/applications',
				query : options,
				rawStream : true
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getUpdate = (options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		let exec = co(function *() {

			let headers = yield ensureAuthHeaders(options);

			return yield req.get({
				headers : headers,
				pathname : '/v2/applications',
				query : options,
				rawStream : true
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

			let headers = yield ensureAuthHeaders(options);

			return yield req.get({
				headers : headers,
				pathname : ['/v2/devices/', deviceId.replace(/\:/g, ''), '/activation'].join(''),
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

			let headers = yield ensureAuthHeaders(options);

			return yield req.get({
				headers : headers,
				pathname : `/v2/orders/${orderId}`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.settings = () => (settings);

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
