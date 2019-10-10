/* eslint-disable no-sync */
var
	events = require('events'),
	co = require('co'),
	fs = require('fs'),
	request = require('./request'),
	validation = require('./validation');

const
	DEFAULT_HOST = 'campaign-api.apps.playnetwork.com',
	DEFAULT_SECURE = true,
	EVENT_REQUEST = 'request',
	EVENT_RESPONSE = 'response',
	BOUNDARY_LENGTH = 60;


module.exports = function (campaignOptions, ensureAuthHeaders, self) {
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
		validation.isEmpty(campaignOptions) || validation.isEmpty(campaignOptions.host) ?
			DEFAULT_HOST :
			campaignOptions.host;

	settings.secure =
		validation.isEmpty(campaignOptions) || typeof campaignOptions.secure !== 'boolean' ?
			DEFAULT_SECURE :
			campaignOptions.secure;

	// apply additional optional settings if supplied
	settings = validation.applyOptionalParameters(campaignOptions, settings);

	// ensure request is setup
	req = new request.Request(settings);
	req.on(EVENT_REQUEST, (data) => (self.emit(EVENT_REQUEST, data)));
	req.on(EVENT_RESPONSE, (data) => (self.emit(EVENT_RESPONSE, data)));

	self.settings = () => (settings);

	// for internal use only (Broadcast Engine); no need to document for external consumption
	self.mixCampaigns = (deviceId, options, callback) => {
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

			if (/^\d+$/.test(deviceId) === false) {
				return yield Promise.reject(new Error('deviceId must be numeric'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.post({
				headers: headers,
				pathname: `/v3/campaigns/mix/${deviceId}`
			}, options);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.version = (callback) => {
		let exec = co(function *() {
			return yield req.get({
				pathname: '/v3/version'
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	return self;
};
