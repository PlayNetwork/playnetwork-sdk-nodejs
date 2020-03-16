var
	co = require('co'),
	events = require('events'),
	io = require('socket.io-client'),
	url = require('./url'),
	validation = require('./validation');

let
	primaryInterface,
	socket;

module.exports = function (playerOptions, ensureAuthHeaders, self) {
	'use strict';

	const
		AUTH_ERROR = 401,
		AUTH_TOKEN = 'x-authentication-token',
		CLIENT_ID = 'x-client-id',
		DEFAULT_HOST = 'player-svc.apps.playnetwork.com',
		DEFAULT_SECURE = true,
		RECONNECT_MS = 60000;

	let
		req,
		protocol,
		settings = {};

	self = self || {};

	// determine settings
	settings.host =
		validation.isEmpty(playerOptions) || validation.isEmpty(playerOptions.host) ?
			DEFAULT_HOST :
			playerOptions.host;

	settings.secure =
		validation.isEmpty(playerOptions) || validation.isEmpty(playerOptions.secure) ?
			DEFAULT_SECURE :
			playerOptions.secure;

	if (settings.secure) {
		protocol = 'https'
	} else {
		protocol = 'http';
	}

	// apply additional optional settings if supplied
	settings = validation.applyOptionalParameters(playerOptions, settings);

	const result = url.parseURL(settings.host);
	if (!validation.isEmpty(result)) {
		settings.host = result.host;
		settings.port = result.port;
		settings.secure = result.secure;
	}

	self.settings = () => (settings);

	self.connect = (options, socketEventSubscriber) => co(function *() {
		if (validation.isEmpty(socketEventSubscriber)) {
			socketEventSubscriber = options;
			options = {};
		}

		if ([
  			validation.isEmpty(socketEventSubscriber),
  			validation.isEmpty(socketEventSubscriber.emit),
  			typeof socketEventSubscriber.emit !== 'function'
		].some((val) => val)) {
  			throw new Error('socketEventSubscriber must be an instance of event.EventEmitter');
		}

		let
			authHeaders = yield ensureAuthHeaders(),
			authToken,
			clientId,
			query,
			url;

		authToken = authHeaders[AUTH_TOKEN];
		clientId = authHeaders[CLIENT_ID];

		url = [protocol, '://', options.host || settings.host].join('');
		query = ['clientId=', clientId, '&token=', authToken].join('');

		socket = new io(url, { 'query' : query});

		// fired after a successful connection
		socket.on('connect', () => {
			let connection = {
				'connectionAttempt' : 0,
				'isReconnect' : false,
				'url' : url
			};

			socketEventSubscriber.emit('connected', connection);
		});

		socket.on('connect_error', (err) => {
			socketEventSubscriber.emit('error', err);
		});

		// fired after a successful disconnection connection
		socket.on('disconnect', () => {
			socketEventSubscriber.emit('disconnected');
		});

		socket.on('error', (err) => {
			try {
				err = JSON.parse(err);
			} catch (e) {
				err = e;
			}
			socketEventSubscriber.emit('error', err);

			if (err.code === AUTH_ERROR) {
				socket.disconnect();

				// reconnect if failed during authorization
				if (options.reconnectOnAuthFailure) {
					setTimeout(function() {
						self.connect(socketEventSubscriber);
					}, RECONNECT_MS);
				}
			}
		});

		socket.on('message', (data) => {
			socketEventSubscriber.emit('message', data);
		});

		// remap playerRpc to message specifically for z8 player since
		// we don't plan to retrofit the UI anytime soon
		socket.on('playerRpc', (data) => {
			socketEventSubscriber.emit('message', data);
		});

		// fired when reconnect is successful
		socket.on('reconnect', (attempt) => {
			let connection = {
				'connectionAttempt' : attempt,
				'isReconnect' : true,
				'url' : url
			};

			socketEventSubscriber.emit('connected', connection);
		});

		// fired upon attempt to reconnect
		socket.on('reconnecting', (attempt) => {
			let connection = {
				'connectionAttempt' : attempt,
				'url' : url
			};

			socketEventSubscriber.emit('reconnecting', connection);
		});

		socket.on('reconnect_attempt', (attempt) => co(function *() {
			let
				authHeaders = yield ensureAuthHeaders(),
				authToken = authHeaders[AUTH_TOKEN],
				clientId = authHeaders[CLIENT_ID];

			socket.io.opts.query = [
				'clientId=', 
				clientId, 
				'&token=', 
				authToken].join('');

			let connection = {
				'connectionAttempt' : attempt,
				'url' : url
			};

			socketEventSubscriber.emit('reconnecting', connection);
		}).catch((ex) => socket.emit('reconnect_error', ex)));

		// fired on reconnect error
		socket.on('reconnect_error', (err) => {
			socketEventSubscriber.emit('error', err);
		});
	});

	self.disconnect = () => {
		if (!socket) {
			throw new Error('Unable to disconnect, no socket connection');
		}

		socket.disconnect();
	};

	self.emit = (event, data) => {
		if (!socket) {
			throw new Error('Unable to emit, no socket connection');
		}

		socket.emit(event, data);
	};

	return self;
}
