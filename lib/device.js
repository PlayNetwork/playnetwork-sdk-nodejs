var
	events = require('events'),

	co = require('co'),

	request = require('./request'),
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
			let headers = yield ensureAuthHeaders;

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
			let headers = yield ensureAuthHeaders;

			return yield req.get({
				headers : headers,
				pathname : '/v0/groups',
				query : options
			});
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
				return Promise.reject(new Error('deviceId is required'));
			}

			if (validation.isEmpty(messages)) {
				return Promise.reject(new Error('event messages are required'));
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
				headers = yield ensureAuthHeaders;

			if (hasErrorInMessage) {
				return Promise.reject(
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
				return Promise.reject(new Error('deviceId is required'));
			}

			if (validation.isEmpty(status)) {
				return Promise.reject(new Error('status details are required'));
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
				return Promise.reject(new Error('deviceId is required'));
			}

			let headers = yield ensureAuthHeaders;

			return yield req.get({
				headers : headers,
				pathname : `/v0/devices/${deviceId}`,
				query : options
			});
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
				return Promise.reject(new Error('groupId is required'));
			}

			let headers = yield ensureAuthHeaders;

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

		if (typeof deviceId === 'function') {
			callback = groupId;
			groupId = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(groupId)) {
				return Promise.reject(new Error('groupId is required'));
			}

			let headers = yield ensureAuthHeaders;

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

		if (typeof deviceId === 'function') {
			callback = groupId;
			groupId = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(groupId)) {
				return Promise.reject(new Error('groupId is required'));
			}

			let headers = yield ensureAuthHeaders;

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
				return Promise.reject(new Error('groupIdList is required'));
			}

			let headers = yield ensureAuthHeaders;

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
				return Promise.reject(new Error('groupIdList is required'));
			}

			let headers = yield ensureAuthHeaders;

			return yield req.post({
				headers : headers,
				pathname : '/v0/groups/analytics'
			}, groupIdList);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.settings = () => (settings);

	return self;
};
