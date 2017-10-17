var
	events = require('events'),

	co = require('co'),

	request = require('./request'),
	validation = require('./validation');

const
	DEFAULT_HOST = 'provision-api.apps.playnetwork.com',
	DEFAULT_SECURE = true,
	EVENT_REQUEST = 'request',
	EVENT_RESPONSE = 'response';


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

  self.getClientCredentialsStream = (deviceId, options) => {
    let exec = co(function *() {
      if (validation.isEmpty(deviceId)) {
        return yield Promise.reject(new Error('deviceId is required'));
      }

      let headers = yield ensureAuthHeaders(options);

      return yield req.get({
        headers : headers,
        pathname : ['/v2/devices/', deviceId.replace(/\:/g, ''), '/activation'].join(''),
        query : options,
				rawStream : true
      });
    });

    return exec;
  };

  self.getApplicationsStream = (options) => {
    let exec = co(function *() {
      let headers = yield ensureAuthHeaders(options);

      return yield req.get({
        headers : headers,
        pathname : '/v2/devices',
				query : options,
				rawStream : true
      });
    });

    return exec;
  };

	self.settings = () => (settings);

	self.version = (callback) => {
		let exec = co(function *() {
			return yield req.get({
				pathname : '/v1/version'
			});
		});

		return exec;
	};

	return self;
};
