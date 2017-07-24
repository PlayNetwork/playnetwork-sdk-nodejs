/*eslint no-magic-numbers: 0*/
/*eslint no-unused-expressions: 0*/
var
	chai = require('chai'),
	co = require('co'),
	events = require('events'),
	should = chai.should(),
	mockSocketIOClient = require('../Mocks/mockSocketIOClient');

describe('playersvc', () => {
	'use strict';

	let
		ensureAuthHeaders = function () {
			return new Promise((resolve, reject) => {
				return resolve({
					'x-client-id': 'test',
					'x-authentication-token': 'test'
				})
			})
		},
		playersvc,
		playersvcSubscriber;

	beforeEach(() => {
		playersvc = mockSocketIOClient.rewire('../../lib/playersvc.js', null)(null, ensureAuthHeaders);
		playersvcSubscriber = Object.create(events.EventEmitter.prototype);
		events.EventEmitter.call(playersvcSubscriber);
	});

	afterEach(() => {
		playersvcSubscriber.removeAllListeners();
	});

	describe('#connect/emit', () => {
		it('should connect', (done) => {
			playersvcSubscriber.on('connect', (args) => {
				//now emit something to get test coverage
				playersvc.emit('hello');

				setTimeout(function() {
					return done();
				}, 500);
			});

			playersvc.connect(playersvcSubscriber);
		});

		it('should connect/disconnect and connect again', (done) => {
			let connectionCount = 0;

			playersvcSubscriber.on('connect', (args) => {
				connectionCount++;

				setTimeout(function() {
					playersvc.disconnect();
				}, 500);
			});

			playersvcSubscriber.on('disconnect', (args) => {
				// reconnect right away if connection count is less than 2
				if (connectionCount >= 2) {
					return done();
				}
				setTimeout(function() {
					playersvc.connect(playersvcSubscriber);
				}, 500);
			});

			playersvc.connect(playersvcSubscriber);
		}).timeout(5000);

		it('should connect non-default host', (done) => {
			playersvc = mockSocketIOClient.rewire('../../lib/playersvc.js', null)({host: 'https://player-svc.apps.playnetwork.com'}, ensureAuthHeaders);

			playersvcSubscriber.on('connect', (args) => {
				setTimeout(function() {
					return done();
				}, 500);
			});

			playersvc.connect(playersvcSubscriber);
		});

		it('#notify subscriber playerRpc for coverage', (done) => {
			let configOpts = {
					notifySubscriber : {
						playerRpc : {
							message : 'test',
							occursAt : 2000
						}
					}
				};

			playersvc = mockSocketIOClient.rewire('../../lib/playersvc.js', configOpts)(null, ensureAuthHeaders);

			playersvcSubscriber.on('playerRpc', (message) => {
				if (message === 'test') {
					return done();
				}

				return done(err);
			});

			playersvc.connect(playersvcSubscriber);
		}).timeout(5000);
	});

	describe('#errors', () => {
		it('emit should error with no socket connect', () => {
			try {
				playersvc.emit('hello there');
			} catch (err) {
				err.message.should.equal('Unable to emit, no socket connection');
			}
		});

		it('#notify subscriber error for coverage', (done) => {
			let configOpts = {
					notifySubscriber : {
						error : {
							message : 'test',
							occursAt : 2000
						}
					}
				};

			playersvc = mockSocketIOClient.rewire('../../lib/playersvc.js', configOpts)(null, ensureAuthHeaders);

			playersvcSubscriber.on('error', (err) => {
				if (err.message === 'test') {
					return done();
				}

				return done(err);
			});

			playersvc.connect(playersvcSubscriber);
		}).timeout(5000);

		it('disconnect should error with no connection', () => {
			// call disconnect without connecting
			try {
				playersvc.disconnect();
			} catch (err) {
				err.message.should.equal('Unable to disconnect, no socket connection');
			}
		});
	});

	describe('#disconnect', () => {
		it('should connect and then disconnect', (done) => {
			let
				connected = false,
				url;

			playersvcSubscriber.on('connect', (args) => {
				connected = true;

				setTimeout(function() {
					playersvc.disconnect();
				}, 1000)
			});

			playersvcSubscriber.on('disconnect', () => {
				if (connected) {
					return done();
				}

				return done(new Error('got a disconnect without connecting first'));
			})

			playersvc.connect(playersvcSubscriber);
		}).timeout(5000);
	})
});
