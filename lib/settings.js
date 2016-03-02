var
	events = require('events'),

	co = require('co'),

	request = require('./request'),
	validation = require('./validation');

const
	DEFAULT_HOST = 'curio-settings-api.apps.playnetwork.com',
	DEFAULT_SECURE = true,
	EVENT_REQUEST = 'request',
	EVENT_RESPONSE = 'response';


module.exports = function (settingsOptions, ensureAuthHeaders, self) {
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
		validation.isEmpty(settingsOptions) || validation.isEmpty(settingsOptions.host) ?
			DEFAULT_HOST :
			settingsOptions.host;

	settings.secure =
		validation.isEmpty(settingsOptions) || validation.isEmpty(settingsOptions.secure) ?
			DEFAULT_SECURE :
			settingsOptions.secure;

	// ensure request is setup
	req = new request.Request(settings);
	req.on(EVENT_REQUEST, (data) => (self.emit(EVENT_REQUEST, data)));
	req.on(EVENT_RESPONSE, (data) => (self.emit(EVENT_RESPONSE, data)));

	self.allSettings = (options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		let exec = co(function *() {
			let headers = yield ensureAuthHeaders;

			return yield req.get({
				headers : headers,
				pathname : '/v0/settings',
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.createSetting = (setting, callback) => {
		// handle any non-specified input params
		if (typeof optinos === 'function') {
			callback = setting;
			setting = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(setting)) {
				return Promise.reject(new Error('setting is required'));
			}

			if (validation.isEmpty(setting.legacy)) {
				return Promise.reject(new Error('setting legacy is required'));
			}

			if (validation.isEmpty(setting.legacy.deviceToken)) {
				return Promise.reject(new Error('setting legacy deviceToken is required'));
			}

			if (validation.isEmpty(setting.legacy.conceptName)) {
				return Promise.reject(new Error('setting legacy conceptName is required'));
			}

			let headers = yield ensureAuthHeaders;

			return yield req.post({
				headers : headers,
				pathname : '/v0/settings'
			}, setting);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getSetting = (settingId, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof settingId === 'function') {
			callback = settingId;
			settingId = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(settingId)) {
				return Promise.reject(new Error('settingId is required'));
			}

			let headers = yield ensureAuthHeaders;

			return yield req.get({
				headers : headers,
				pathname : `/v0/settings/${settingId}`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.settings = () => (settings);

	self.updateSetting = (setting, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = setting;
			setting = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(setting)) {
				return Promise.reject(new Error('setting is required'));
			}

			let headers = yield ensureAuthHeaders;

			return yield req.put({
				headers : headers,
				pathname : '/v0/settings'
			}, setting);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	return self;
};
