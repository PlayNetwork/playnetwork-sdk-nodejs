/*eslint no-magic-numbers: 0*/
/*eslint no-unused-expressions: 0*/
/*eslint camelcase: 0*/
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

		it('#notify subscriber connection error for coverage', (done) => {
			let configOpts = {
					notifySubscriber : {
						connect_error : {
							message : 'test',
							occursAt : 2000
						}
					}
				};

			playersvc = mockSocketIOClient.rewire('../../lib/playersvc.js', configOpts)(null, ensureAuthHeaders);

			playersvcSubscriber.on('connect_error', (err) => {
				if (err.message === 'test') {
					return done();
				}

				return done(err);
			});

			playersvc.connect(playersvcSubscriber);
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

			playersvc = mockSocketIOClient.rewire('../../lib/playersvc.js', configOpts)(null, ensureAuthHeaders);

			playersvcSubscriber.on('reconnect', (number) => {
				if (number === 12) {
					return done();
				}

				return done('reconnect was successful but not the correct number of attempts, expecting 12 got, ', number);
			});

			playersvc.connect(playersvcSubscriber);
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

			playersvc = mockSocketIOClient.rewire('../../lib/playersvc.js', configOpts)(null, ensureAuthHeaders);

			playersvcSubscriber.on('reconnecting', (number) => {
				if (number === 5) {
					return done();
				}

				return done('Unexpected number arg expecting 5, actual ', number);
			});

			playersvc.connect(playersvcSubscriber);
		}).timeout(5000);

		it('#notify subscriber reconnect_attempt', (done) => {
			let configOpts = {
					notifySubscriber : {
						reconnect_attempt : {
							occursAt : 2000
						}
					}
				};

			playersvc = mockSocketIOClient.rewire('../../lib/playersvc.js', configOpts)(null, ensureAuthHeaders);

			playersvcSubscriber.on('reconnect_attempt', () => {
				return done();
			});

			playersvc.connect(playersvcSubscriber);
		}).timeout(5000);

		it('#notify subscriber reconnect_failed', (done) => {
			let configOpts = {
					notifySubscriber : {
						reconnect_failed : {
							occursAt : 2000
						}
					}
				};

			playersvc = mockSocketIOClient.rewire('../../lib/playersvc.js', configOpts)(null, ensureAuthHeaders);

			playersvcSubscriber.on('reconnect_failed', () => {
				return done();
			});

			playersvc.connect(playersvcSubscriber);
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

			playersvc = mockSocketIOClient.rewire('../../lib/playersvc.js', configOpts)(null, ensureAuthHeaders);

			playersvcSubscriber.on('reconnect_error', (err) => {
				if (err.message === 'test') {
					return done();
				}

				return done(err);
			});

			playersvc.connect(playersvcSubscriber);
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
			});

			playersvc.connect(playersvcSubscriber);
		}).timeout(5000);
	});
});
