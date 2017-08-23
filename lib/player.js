var
	co = require('co'),
	events = require('events'),
	io = require('socket.io-client'),
	validation = require('./validation');

let
	primaryInterface,
	socket;

module.exports = function (playerOptions, ensureAuthHeaders, self) {
	'use strict';

	const
		AUTH_TOKEN = 'x-authentication-token',
		CLIENT_ID = 'x-client-id',
		DEFAULT_HOST = 'player-svc.apps.playnetwork.com',
		DEFAULT_SECURE = true;

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

	self.settings = () => (settings);

	self.connect = (socketEventSubscriber) => {
		co(function *() {
			let
				authHeaders = yield ensureAuthHeaders(),
				authToken = authHeaders[AUTH_TOKEN],
				clientId = authHeaders[CLIENT_ID],
				url;

			url = [protocol,
				'://',
				settings.host,
				'?clientId=',
				clientId,
				'&token=',
				authToken].join('');

			socket = io(url);

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
				socketEventSubscriber.emit('error', err);
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

			// fired on reconnect error
			socket.on('reconnect_error', (err) => {
				socketEventSubscriber.emit('error', err);
			});
		});
	};

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
