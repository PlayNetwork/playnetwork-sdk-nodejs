var
	events = require('events'),

	co = require('co'),

	request = require('./request'),
	validation = require('./validation');

const
	DEFAULT_HOST = 'location-relationships-api.apps.playnetwork.com',
	DEFAULT_SECURE = true,
	EVENT_REQUEST = 'request',
	EVENT_RESPONSE = 'response';


module.exports = function (relationshipsOptions, ensureAuthHeaders, self) {
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
		validation.isEmpty(relationshipsOptions) || validation.isEmpty(relationshipsOptions.host) ?
			DEFAULT_HOST :
			relationshipsOptions.host;

	settings.secure =
		validation.isEmpty(relationshipsOptions) || validation.isEmpty(relationshipsOptions.secure) ?
			DEFAULT_SECURE :
			relationshipsOptions.secure;

	// apply additional optional settings if supplied
	settings = validation.applyOptionalParameters(relationshipsOptions, settings);

	// ensure request is setup
	req = new request.Request(settings);
	req.on(EVENT_REQUEST, (data) => (self.emit(EVENT_REQUEST, data)));
	req.on(EVENT_RESPONSE, (data) => (self.emit(EVENT_RESPONSE, data)));

	self.allRelationships = (options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		let exec = co(function *() {
			let headers = yield ensureAuthHeaders(options);

			return yield req.get({
				headers : headers,
				pathname : '/v0/relationships',
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.createRelationship = (relationship, callback) => {
		// handle any non-specified input params
		if (typeof relationship === 'function') {
			callback = relationship;
			relationship = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(relationship)) {
				return yield Promise.reject(new Error('relationship is required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.post({
				headers : headers,
				pathname : '/v0/relationships'
			}, relationship);
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.deleteRelationship = (relationshipId, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		if (typeof relationshipId === 'function') {
			callback = relationshipId;
			relationshipId = undefined;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(relationshipId)) {
				return yield Promise.reject(new Error('relationshipId is required'));
			}

			let headers = yield ensureAuthHeaders(options);

			return yield req.delete({
				headers : headers,
				pathname : `/v0/relationships/${relationshipId}`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.getRelationship = (relationshipId, options, callback) => {
		// handle any non-specified input params
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(relationshipId)) {
				return yield Promise.reject(new Error('relationshipId is required'));
			}

			let headers = yield ensureAuthHeaders(options);

			return yield req.get({
				headers : headers,
				pathname : `/v0/relationships/${relationshipId}`,
				query : options
			});
		});

		return validation.promiseOrCallback(exec, callback);
	};

	self.settings = () => (settings);

	self.upsertRelationships = (relationships, callback) => {
		// handle any non-specified input params
		if (typeof relationships === 'function') {
			callback = relationships;
			relationships = undefined;
		}

		let exec = co(function *() {
			if (validation.isEmpty(relationships)) {
				return yield Promise.reject(new Error('relationships are required'));
			}

			let headers = yield ensureAuthHeaders();

			return yield req.put({
				headers : headers,
				pathname : '/v0/relationships'
			}, relationships);
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
