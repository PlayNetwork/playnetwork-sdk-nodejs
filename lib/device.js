var
	events = require('events'),

	co = require('co'),

	request = require('./request'),
	url = require('./url'),
	validation = require('./validation');

const
	DEFAULT_HOST = 'device-api.apps.playnetwork.com',
	DEFAULT_LEVEL = 'INFO',
	DEFAULT_MESSAGE = 'Status Report',
	DEFAULT_SECURE = true,
	EVENT_REQUEST = 'request',
	EVENT_RESPONSE = 'response';


module.exports = function (deviceOptions, ensureAuthHeaders, self) {
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
		validation.isEmpty(deviceOptions) || validation.isEmpty(deviceOptions.host) ?
			DEFAULT_HOST :
			deviceOptions.host;

	settings.secure =
		validation.isEmpty(deviceOptions) || validation.isEmpty(deviceOptions.secure) ?
			DEFAULT_SECURE :
			deviceOptions.secure;

	// apply additional optional settings if supplied
	settings = validation.applyOptionalParameters(deviceOptions, settings);

	const result = url.parseURL(settings.host);
	if (!validation.isEmpty(result)) {
		settings.host = result.host;
		settings.port = result.port;
		settings.secure = result.secure;
	}

	// ensure request is setup
	req = new request.Request(settings);
	req.on(EVENT_REQUEST, (data) => (self.emit(EVENT_REQUEST, data)));
	req.on(EVENT_RESPONSE, (data) => (self.emit(EVENT_RESPONSE, data)));

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
				pathname : '/v0/devices',
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.allGroups = (options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		let exec = co(function *() {
			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : '/v0/groups',
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.createDiagnostics = (deviceId, diagnostics, callback) => {
		if (typeof diagnostics === 'function') {
			callback = diagnostics;
			diagnostics = deviceId;
			deviceId = diagnostics.deviceId;
		}

		if (typeof deviceId === 'function') {
			callback = deviceId;
			diagnostics = undefined;
			deviceId = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(deviceId)) {
				return yield Promise.reject(new Error('deviceId is required'));
			}

			// ensure diagnostics was not supplied as the 1st argument
			if (!validation.isEmpty(deviceId.deviceId) && validation.isEmpty(diagnostics)) {
				diagnostics = deviceId;
				deviceId = diagnostics.deviceId;
			}

			// ensure we have diagnostics
			if (validation.isEmpty(diagnostics)) {
				return yield Promise.reject(new Error('diagnostics are required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.post({
				headers : headers,
				pathname : `/v0/devices/${deviceId}/diagnostics`
			}, diagnostics);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.createEventMessages = (deviceId, messages, callback) => {
		// handle any non-specified input params
		if (typeof messages === 'function') {
			callback = messages;
			messages = undefined;
		}

		if (typeof deviceId === 'function') {
			callback = deviceId;
			deviceId = undefined;
			data = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(deviceId)) {
				return yield Promise.reject(new Error('deviceId is required'));
			}

			if (validation.isEmpty(messages)) {
				return yield Promise.reject(new Error('event messages are required'));
			}

			if (!Array.isArray(messages)) {
				messages = [messages];
			}

			let
				hasErrorInMessage = messages.some((item, i) => {
					// handle string event message scenario
					if (typeof item === 'string') {
						messages[i] = {
							deviceId : deviceId,
							level : DEFAULT_LEVEL,
							message : item,
							timestamp : new Date()
						};

						return false;
					}

					if (validation.isEmpty(item.message)) {
						return true;
					}

					if (validation.isEmpty(item.deviceId)) {
						item.deviceId = deviceId;
					}

					if (validation.isEmpty(item.level)) {
						item.level = DEFAULT_LEVEL;
					}

					if (validation.isEmpty(item.timestamp)) {
						item.timestamp = new Date();
					}

					return false;
				}),
				headers = yield ensureAuthHeaders();

			if (hasErrorInMessage) {
				return yield Promise.reject(
					new Error('all event messages require message property'));
			}

			return yield req.post({
				headers : headers,
				pathname : `/v0/devices/${deviceId}/events`
			}, messages);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.createStatusReport = (deviceId, status, callback) => {
		// handle any non-specified input params
		if (typeof status === 'function') {
			callback = status;
			status = undefined;
		}

		if (typeof deviceId === 'function') {
			callback = deviceId;
			deviceId = undefined;
			status = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(deviceId)) {
				return yield Promise.reject(new Error('deviceId is required'));
			}

			if (validation.isEmpty(status)) {
				return yield Promise.reject(new Error('status details are required'));
			}

			if (validation.isEmpty(status.deviceId)) {
				status.deviceId = deviceId;
			}

			if (validation.isEmpty(status.level)) {
				status.level = DEFAULT_LEVEL;
			}

			if (validation.isEmpty(status.message)) {
				status.message = DEFAULT_MESSAGE;
			}

			if (validation.isEmpty(status.timestamp)) {
				status.timestamp = new Date();
			}

			return yield self.createEventMessages(deviceId, [status]);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getAnalytics = (options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		let exec = co(function *() {
			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : '/v0/devices/analytics',
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
				pathname : `/v0/devices/${deviceId}`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getDevices = (deviceIdList, callback) => {
		// handle any non-specified input params
		if (typeof deviceIdList === 'function') {
			callback = deviceIdList;
			deviceIdList = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(deviceIdList)) {
				return yield Promise.reject(new Error('deviceIdList is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.post({
				headers : headers,
				pathname : '/v0/devices/deviceIds'
			}, deviceIdList);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getGroup = (groupId, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof groupId === 'function') {
			callback = groupId;
			groupId = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(groupId)) {
				return yield Promise.reject(new Error('groupId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : `/v0/groups/${groupId}`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getGroupAnalytics = (groupId, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof groupId === 'function') {
			callback = groupId;
			groupId = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(groupId)) {
				return yield Promise.reject(new Error('groupId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : `/v0/groups/${groupId}/analytics`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getGroupDevices = (groupId, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof groupId === 'function') {
			callback = groupId;
			groupId = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(groupId)) {
				return yield Promise.reject(new Error('groupId is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.get({
				headers : headers,
				pathname : `/v0/groups/${groupId}/devices`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getGroups = (groupIdList, callback) => {
		// handle any non-specified input params
		if (typeof groupIdList === 'function') {
			callback = groupIdList;
			groupIdList = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(groupIdList)) {
				return yield Promise.reject(new Error('groupIdList is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.post({
				headers : headers,
				pathname : '/v0/groups/deviceGroupIds'
			}, groupIdList);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getGroupsAnalytics = (groupIdList, callback) => {
		// handle any non-specified input params
		if (typeof groupIdList === 'function') {
			callback = groupIdList;
			groupIdList = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(groupIdList)) {
				return yield Promise.reject(new Error('groupIdList is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.post({
				headers : headers,
				pathname : '/v0/groups/analytics'
			}, groupIdList);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.settings = () => (settings);

	self.upsertDevices= (devices, callback) => {
		// handle any non-specified input params
		if (typeof devices === 'function') {
			callback = devices;
			devices = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(devices)) {
				return yield Promise.reject(new Error('devices are required'));
			}

			// ensure the devices are in an array format
			if (!Array.isArray(devices)) {
				devices = [devices];
			}

			let
				err,
				foundError = devices.some((device, i) => {
					if (validation.isEmpty(device.deviceId)) {
						err = new Error(
							`device ${i} of ${devices.length}: deviceId is required`);
						return true;
					}

					return false;
				}),
				headers;

			if (foundError) {
				return yield Promise.reject(err);
			}

			headers = yield ensureAuthHeaders();

			return yield req.put({
				headers : headers,
				pathname : '/v0/devices'
			}, devices);
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
