var
	co = require('co'),
	events = require('events'),
	io = require('socket.io-client'),
	validation = require('./validation');

let
	primaryInterface,
	socket;

module.exports = function (playerServiceOptions, ensureAuthHeaders, self) {
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
		validation.isEmpty(playerServiceOptions) || validation.isEmpty(playerServiceOptions.host) ?
			DEFAULT_HOST :
			playerServiceOptions.host;

	settings.secure =
		validation.isEmpty(playerServiceOptions) || validation.isEmpty(playerServiceOptions.secure) ?
			DEFAULT_SECURE :
			playerServiceOptions.secure;

	if (settings.secure) {
		protocol = 'https'
	} else {
		protocol = 'http';
	}

	// apply additional optional settings if supplied
	settings = validation.applyOptionalParameters(playerServiceOptions, settings);

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

			socket.on('connect', () => {
				socketEventSubscriber.emit('connect', url);
			});

			socket.on('connect_error', (err) => {
				socketEventSubscriber.emit('connect_error', err);
			});

			socket.on('disconnect', () => {
				socketEventSubscriber.emit('disconnect');
			});

			socket.on('error', (err) => {
				socketEventSubscriber.emit('error', err);
			});

			socket.on('playerRpc', (data) => {
				socketEventSubscriber.emit('playerRpc', data);
			});

			socket.on('reconnect', (number) => {
				socketEventSubscriber.emit('reconnect', number);
			});

			socket.on('reconnecting', (number) => {
				socketEventSubscriber.emit('reconnecting', number);
			});

			socket.on('reconnect_attempt', () => {
				socketEventSubscriber.emit('reconnect_attempt', url);
			});

			socket.on('reconnect_error', (err) => {
				socketEventSubscriber.emit('reconnect_error', err);
			});

			socket.on('reconnect_failed', () => {
				socketEventSubscriber.emit('reconnect_failed');
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
