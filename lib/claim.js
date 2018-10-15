var
	events = require('events'),

	co = require('co'),

	request = require('./request'),
	validation = require('./validation');

const
	DEFAULT_HOST = 'claim-api.apps.playnetwork.com',
	DEFAULT_SECURE = true,
	EVENT_REQUEST = 'request',
	EVENT_RESPONSE = 'response';


module.exports = function (claimOptions, ensureAuthHeaders, self) {
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
		validation.isEmpty(claimOptions) || validation.isEmpty(claimOptions.host) ?
			DEFAULT_HOST :
			claimOptions.host;

	settings.secure =
		validation.isEmpty(claimOptions) || validation.isEmpty(claimOptions.secure) ?
			DEFAULT_SECURE :
			claimOptions.secure;

	// apply additional optional settings if supplied
	settings = validation.applyOptionalParameters(claimOptions, settings);

	// ensure request is setup
	req = new request.Request(settings);
	req.on(EVENT_REQUEST, (data) => (self.emit(EVENT_REQUEST, data)));
	req.on(EVENT_RESPONSE, (data) => (self.emit(EVENT_RESPONSE, data)));

	self.allClaims = (clientId, serviceId, callback) => {
		// handle any non-specified input params
		if (typeof serviceId === 'function') {
			callback = serviceId;
			serviceId = undefined;
		}

		if (typeof clientId === 'function') {
			callback = clientId;
			clientId = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(clientId)) {
				return yield Promise.reject(new Error('clientId is required'));
			}

			if (validation.isEmpty(serviceId)) {
				return yield Promise.reject(new Error('serviceId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : `/v0/clients/${clientId}/services/${serviceId}/claims`
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.allClaimsForClient = (clientId, callback) => {
		// handle any non-specified input params
		if (typeof clientId === 'function') {
			callback = clientId;
			clientId = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(clientId)) {
				return yield Promise.reject(new Error('clientId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : `/v0/clients/${clientId}/claims`
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
