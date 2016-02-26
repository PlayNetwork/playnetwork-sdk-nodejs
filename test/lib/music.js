/*eslint no-magic-numbers: 0*/
/*eslint no-unused-expressions: 0*/
var
	chai = require('chai'),
	co = require('co'),
	nock = require('nock'),

	MusicProxy = require('../../lib/music'),

	should = chai.should();


describe('music', () => {
	'use strict';

	let
		ensureAuthHeaders = new Promise((resolve, reject) => {
			return resolve({
				'x-client-id': 'test',
				'x-authentication-token': 'test'
			})
		}),
		music,
		requestInfo,
		responseInfo;

	afterEach(() => {
		requestInfo = undefined;
		responseInfo = undefined;
	});

	beforeEach(() => {
		music = new MusicProxy(null, ensureAuthHeaders);

		// capture request and response info
		music.on('request', (info) => (requestInfo = info));
		music.on('response', (info) => (responseInfo = info));
	});

	describe('ctor', () => {
		it('should properly construct', () => {
			let
				proxy1 = new MusicProxy({
					host : 'one'
				}),
				proxy2 = new MusicProxy({
					host : 'two'
				});

			proxy1.settings().host.should.not.equal(proxy2.settings().host);
		});

		it('should be constructable without options...', () => {
			let proxy = new MusicProxy();
			proxy.settings().should.not.be.empty;
			should.exist(proxy.settings().host);
			should.exist(proxy.settings().secure);
		});

		it('should be constructable with options...', () => {
			let
				options = {
					host : 'develop-test-api.apps.playnetwork.com',
					secure : true
				},
				proxy = new MusicProxy(options);

			should.exist(proxy.allBroadcastsForStation);
			should.exist(proxy.allCollections);
			should.exist(proxy.allStations);
			should.exist(proxy.getBroadcastForStation);
			should.exist(proxy.getCollection);
			should.exist(proxy.getStation);
			should.exist(proxy.mixCollection);
			should.exist(proxy.settings);
			proxy.settings().should.not.be.empty;
			proxy.settings().host.should.equal(options.host);
			proxy.settings().secure.should.equal(options.secure);
		});
	});

	describe('#allBroadcastsForStation', () => {
		it('should require stationId', (done) => {
			music.allBroadcastsForStation(function (err, result) {
				should.not.exist(result);
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('stationId is required');

				return done();
			});
		});

		it('should properly retrieve all broadcasts (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/stations/test/broadcasts')
				.reply(200, { total : 0 });

			music.allBroadcastsForStation('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve all broadcasts (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/stations/test/broadcasts')
				.reply(200, { total : 0 });

			music.allBroadcastsForStation('test', function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly support query filters', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get(/\/v2\/stations\/test\/broadcasts[.]*/)
				.reply(200, { total : 0 });

			music.allBroadcastsForStation(
				'test',
				{
					filters : {
						mandatory : {
							exists : 'broadcastId'
						}
					}
				}).then((result) => {
					should.exist(result);
					should.exist(requestInfo);
					should.exist(requestInfo.query);
					should.exist(requestInfo.query['filters[mandatory][exists]']);
					requestInfo.query['filters[mandatory][exists]'].should.equal('broadcastId');

					return done();
				}).catch((err) => (done(err)));
		});
	});

	describe('#allCollections', () => {
		it('should properly retrieve all collections (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/collections')
				.reply(200, { total : 0 });

			music.allCollections()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve all collections (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/collections')
				.reply(200, { total : 0 });

			music.allCollections(function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly support query filters', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get(/\/v2\/collections[.]*/)
				.reply(200, { total : 0 });

			music.allCollections({
				filters : {
					mandatory : {
						exact : {
							'legacy.trackToken' : 12345
						}
					}
				}
			}).then((result) => {
				should.exist(result);
				should.exist(requestInfo);
				should.exist(requestInfo.query);
				should.exist(requestInfo.query['filters[mandatory][exact][legacy.trackToken]']);
				requestInfo.query['filters[mandatory][exact][legacy.trackToken]'].should.equal(12345);

				return done();
			}).catch((err) => (done(err)));
		});
	});

	describe('#allStations', () => {
		it('should properly retrieve all stations (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/stations')
				.reply(200, { total : 0 });

			music.allStations()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve all stations (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/stations')
				.reply(200, { total : 0 });

			music.allStations(function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly support query filters', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get(/\/v2\/stations[.]*/)
				.reply(200, { total : 0 });

			music.allStations({
				filters : {
					mandatory : {
						exact : {
							'legacy.playlistToken' : 12345
						}
					}
				}
			}).then((result) => {
				should.exist(result);
				should.exist(requestInfo);
				should.exist(requestInfo.query);
				should.exist(requestInfo.query['filters[mandatory][exact][legacy.playlistToken]']);
				requestInfo.query['filters[mandatory][exact][legacy.playlistToken]'].should.equal(12345);

				return done();
			}).catch((err) => (done(err)));
		});
	});

	describe('#getBroadcastForStation', () => {
		it('should require broadcastId', (done) => {
			music.getBroadcastForStation()
				.then(() => {
					return done(new Error('should require broadcastId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('broadcastId is required');

					return done();
				})
		});

		it('should require stationId', (done) => {
			music.getBroadcastForStation('test')
				.then(() => {
					return done(new Error('should require stationId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('stationId is required');

					return done();
				})
		});

		it('should properly retrieve broadcast (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/stations/test/broadcasts/test')
				.reply(200, { total : 0 });

			music.getBroadcastForStation('test', 'test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve broadcast (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/stations/test/broadcasts/test')
				.reply(200, { total : 0 });

			music.getBroadcastForStation('test', 'test', function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#getCollection', () => {
		it('should require collectionId', (done) => {
			music.getCollection()
				.then(() => {
					return done(new Error('should require collectionId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('collectionId is required');

					return done();
				})
		});

		it('should properly retrieve collection (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/collections/test')
				.reply(200, { total : 0 });

			music.getCollection('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve collection (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/collections/test')
				.reply(200, { total : 0 });

			music.getCollection('test', function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#getStation', () => {
		it('should require stationId', (done) => {
			music.getStation()
				.then(() => {
					return done(new Error('should require stationId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('stationId is required');

					return done();
				})
		});

		it('should properly retrieve station (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/stations/test')
				.reply(200, { total : 0 });

			music.getStation('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve station (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/stations/test')
				.reply(200, { total : 0 });

			music.getStation('test', function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#mixStation', () => {
		it('should require collectionId', (done) => {
			music.mixCollection()
				.then(() => {
					return done(new Error('should require collectionId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('collectionId is required');

					return done();
				})
		});

		it('should properly retrieve collection (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/collections/test/mix')
				.reply(200, { total : 0 });

			music.mixCollection('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve collection (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/collections/test/mix')
				.reply(200, { total : 0 });

			music.mixCollection('test', function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});
});
