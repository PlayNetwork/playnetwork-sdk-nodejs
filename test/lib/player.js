/*eslint no-magic-numbers: 0*/
/*eslint no-unused-expressions: 0*/
/*eslint camelcase: 0*/
var
	chai = require('chai'),
	co = require('co'),
	events = require('events'),
	should = chai.should(),
	mockSocketIOClient = require('../Mocks/mockSocketIOClient');

describe('player', () => {
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
		player,
		playerSubscriber;

	beforeEach(() => {
		player = mockSocketIOClient.rewire('../../lib/player.js', null)(null, ensureAuthHeaders);
		playerSubscriber = Object.create(events.EventEmitter.prototype);
		events.EventEmitter.call(playerSubscriber);
	});

	afterEach(() => {
		playerSubscriber.removeAllListeners();
	});

	describe('#connect/emit', () => {
		it('should connect', (done) => {
			playerSubscriber.on('connected', (args) => {
				//now emit something to get test coverage
				player.emit('hello');

				setTimeout(function() {
					return done();
				}, 500);
			});

			player.connect(playerSubscriber);
		});

		it('should connect/disconnect and connect again', (done) => {
			let connectionCount = 0;

			playerSubscriber.on('connected', (args) => {
				connectionCount++;

				setTimeout(function() {
					player.disconnect();
				}, 500);
			});

			playerSubscriber.on('disconnected', (args) => {
				// reconnect right away if connection count is less than 2
				if (connectionCount >= 2) {
					return done();
				}
				setTimeout(function() {
					player.connect(playerSubscriber);
				}, 500);
			});

			player.connect(playerSubscriber);
		}).timeout(5000);

		it('should connect non-default host', (done) => {
			player = mockSocketIOClient.rewire('../../lib/player.js', null)({host: 'https://player-svc.apps.playnetwork.com'}, ensureAuthHeaders);

			playerSubscriber.on('connected', (args) => {
				setTimeout(function() {
					return done();
				}, 500);
			});

			player.connect(playerSubscriber);
		});

		it('#notify subscriber playerRpc mapping for coverage', (done) => {
			let configOpts = {
					notifySubscriber : {
						playerRpc : {
							text : 'test',
							occursAt : 2000
						}
					}
				};

			player = mockSocketIOClient.rewire('../../lib/player.js', configOpts)(null, ensureAuthHeaders);

			playerSubscriber.on('message', (message) => {
				if (message === 'test') {
					return done();
				}

				return done(err);
			});

			player.connect(playerSubscriber);
		}).timeout(5000);

		it('#notify subscriber message for coverage', (done) => {
			let configOpts = {
					notifySubscriber : {
						message : {
							text : 'test',
							occursAt : 2000
						}
					}
				};

			player = mockSocketIOClient.rewire('../../lib/player.js', configOpts)(null, ensureAuthHeaders);

			playerSubscriber.on('message', (message) => {
				if (message === 'test') {
					return done();
				}

				return done(err);
			});

			player.connect(playerSubscriber);
		}).timeout(5000);
	});

	describe('#errors', () => {
		it('emit should error with no socket connect', () => {
			try {
				player.emit('hello there');
			} catch (err) {
				err.message.should.equal('Unable to emit, no socket connection');
			}
		});

		it('#notify subscriber connection error for coverage', (done) => {
			let configOpts = {
					notifySubscriber : {
						connect_error : {
							message : 'test',
							occursAt : 2000
						}
					}
				};

			player = mockSocketIOClient.rewire('../../lib/player.js', configOpts)(null, ensureAuthHeaders);

			playerSubscriber.on('error', (err) => {
				if (err.message === 'test') {
					return done();
				}

				return done(err);
			});

			player.connect(playerSubscriber);
		}).timeout(5000);

		it('#notify subscriber reconnect', (done) => {
			let configOpts = {
					notifySubscriber : {
						reconnect : {
							number : 12,
							occursAt : 2000
						}
					}
				};

			player = mockSocketIOClient.rewire('../../lib/player.js', configOpts)(null, ensureAuthHeaders);

			playerSubscriber.on('connected', (connection) => {

				if (!connection.isReconnect) {
					return;
				}

				if (connection.connectionAttempt === 12) {
					return done();
				}

				return done('reconnect was successful but not the correct number of attempts, expecting 12 got, ', connection.connectionAttempt);
			});

			player.connect(playerSubscriber);
		}).timeout(5000);

		it('#notify subscriber reconnecting', (done) => {
			let configOpts = {
					notifySubscriber : {
						reconnecting : {
							number : 5,
							occursAt : 2000
						}
					}
				};

			player = mockSocketIOClient.rewire('../../lib/player.js', configOpts)(null, ensureAuthHeaders);

			playerSubscriber.on('reconnecting', (connection) => {
				if (connection.connectionAttempt === 5) {
					return done();
				}

				return done('Unexpected number arg expecting 5, actual ', connection.connectionAttempt);
			});

			player.connect(playerSubscriber);
		}).timeout(5000);

		it('#notify subscriber reconnecting headerReset', (done) => {
			let configOpts = {
					notifySubscriber : {
						reconnecting : {
							headerReset : true,
							number : 1,
							occursAt : 2000
						}
					}
				};

			player = mockSocketIOClient.rewire('../../lib/player.js', configOpts)(null, ensureAuthHeaders);

			playerSubscriber.on('reconnecting', (connection) => {
				if (connection.headerReset) {
					return done();
				}

				return done('Expected headerReset to be true, actual ', connection.headerReset);
			});

			player.connect(playerSubscriber);
		}).timeout(5000);

		it('#notify subscriber reconnect_error', (done) => {
			let configOpts = {
					notifySubscriber : {
						reconnect_error : {
							message : 'test',
							occursAt : 2000
						}
					}
				};

			player = mockSocketIOClient.rewire('../../lib/player.js', configOpts)(null, ensureAuthHeaders);

			playerSubscriber.on('error', (err) => {
				if (err.message === 'test') {
					return done();
				}

				return done(err);
			});

			player.connect(playerSubscriber);
		}).timeout(5000);

		it('#notify subscriber error for coverage', (done) => {
			let configOpts = {
					notifySubscriber : {
						error : {
							message : 'test',
							occursAt : 2000
						}
					}
				};

			player = mockSocketIOClient.rewire('../../lib/player.js', configOpts)(null, ensureAuthHeaders);

			playerSubscriber.on('error', (err) => {
				if (err.message === 'test') {
					return done();
				}

				return done(err);
			});

			player.connect(playerSubscriber);
		}).timeout(5000);

		it('disconnect should error with no connection', () => {
			// call disconnect without connecting
			try {
				player.disconnect();
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

			playerSubscriber.on('connected', (args) => {
				connected = true;

				setTimeout(function() {
					player.disconnect();
				}, 1000)
			});

			playerSubscriber.on('disconnected', () => {
				if (connected) {
					return done();
				}

				return done(new Error('got a disconnect without connecting first'));
			});

			player.connect(playerSubscriber);
		}).timeout(5000);
	});
});
