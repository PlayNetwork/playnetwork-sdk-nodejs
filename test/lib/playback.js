/*eslint no-magic-numbers: 0*/
/*eslint no-unused-expressions: 0*/
var
	chai = require('chai'),
	co = require('co'),
	nock = require('nock'),

	PlaybackProxy = require('../../lib/playback'),

	should = chai.should();


describe('playback', () => {
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
		playback,
		requestInfo,
		responseInfo;

	afterEach(() => {
		requestInfo = undefined;
		responseInfo = undefined;
	});

	beforeEach(() => {
		playback = new PlaybackProxy(null, ensureAuthHeaders);

		// capture request and response info
		playback.on('request', (info) => (requestInfo = info));
		playback.on('response', (info) => (responseInfo = info));
	});

	describe('ctor', () => {
		it('should properly construct', () => {
			let
				proxy1 = new PlaybackProxy({
					host : 'one'
				}),
				proxy2 = new PlaybackProxy({
					host : 'two'
				});

			proxy1.settings().host.should.not.equal(proxy2.settings().host);
		});

		it('should be constructable without options...', () => {
			let proxy = new PlaybackProxy();
			proxy.settings().should.not.be.empty;
			should.exist(proxy.settings().host);
			should.exist(proxy.settings().secure);
		});

		it('should be constructable with options...', () => {
			let
				options = {
					agent : { proxy : true },
					host : 'develop-test-api.apps.playnetwork.com',
					maxRetries : 1,
					port : 8080,
					rejectUnauthorized : true,
					secure : true
				},
				proxy = new PlaybackProxy(options);

			should.exist(proxy.allPlays);
			should.exist(proxy.recordPlay);
			should.exist(proxy.settings);
			proxy.settings().should.not.be.empty;
			proxy.settings().agent.should.equal(options.agent);
			proxy.settings().host.should.equal(options.host);
			proxy.settings().port.should.equal(options.port);
			proxy.settings().rejectUnauthorized.should.equal(options.rejectUnauthorized);
			proxy.settings().secure.should.equal(options.secure);
		});
	});

	describe('#allPlays', () => {
		it('should require key', (done) => {
			playback.allPlays(function (err, result) {
				should.not.exist(result);
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('key is required');

				return done();
			});
		});

		it('should properly retrieve all plays (promise)', (done) => {
			// intercept outbound request
			nock('https://playback-api.apps.playnetwork.com')
				.get('/v1/plays')
				.reply(200, { total : 0 });

			playback.allPlays('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve all playlist tracks (callback)', (done) => {
			// intercept outbound request
			nock('https://playback-api.apps.playnetwork.com')
				.get('/v1/plays')
				.reply(200, { total : 0 });

			playback.allPlays('test', function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#recordPlay', () => {
		let mockPlay = {
			content : {
				assetId : 'test'
			},
			deviceId : 'aabbcc112233'
		};

		it('should require play', (done) => {
			playback.recordPlay()
				.then(() => {
					return done(new Error('should require play'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('playback data is required');

					return done();
				});
		});

		it('should require content information', (done) => {
			playback.recordPlay({ deviceId : 'test' }, function (err, result) {
				should.not.exist(result);
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('content information is required');

				return done();
			});
		});

		it('should require assetId or legacy.trackToken', (done) => {
			playback.recordPlay({
				content : {
					test : true
				},
				deviceId : 'test'
			}, function (err, result) {
				should.not.exist(result);
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('content identifier is required');

				return done();
			});
		});

		it('should require deviceId or legacy.deviceToken', (done) => {
			playback.recordPlay({
				content : {
					assetId : 'test'
				}
			}, function (err, result) {
				should.not.exist(result);
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('device identifier is required');

				return done();
			});
		});

		it('should properly record playback (promise)', (done) => {
			// intercept outbound request
			nock('https://playback-api.apps.playnetwork.com')
				.post('/v1/plays')
				.reply(201, mockPlay);

			playback.recordPlay(mockPlay)
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly record playback (callback)', (done) => {
			mockPlay.content.legacy = {
				trackToken : 1234
			};
			delete mockPlay.content.assetId;

			// intercept outbound request
			nock('https://playback-api.apps.playnetwork.com')
				.post('/v1/plays')
				.reply(201, mockPlay);

			playback.recordPlay(mockPlay, function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly record playback (with legacy.deviceToken)', (done) => {
			mockPlay.legacy = {
				deviceToken : 1234
			};
			delete mockPlay.deviceId;

			// intercept outbound request
			nock('https://playback-api.apps.playnetwork.com')
				.post('/v1/plays')
				.reply(201, mockPlay);

			playback.recordPlay(mockPlay, function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#version', () => {
		it('should properly return version (promise)', (done) => {
			// intercept outbound request
			nock('https://playback-api.apps.playnetwork.com')
				.get(/\/v[0-9]{1}\/version/i)
				.reply(200, { version : 'test' });

			playback.version()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});

		it('should properly return version (callback)', (done) => {
			// intercept outbound request
			nock('https://playback-api.apps.playnetwork.com')
				.get(/\/v[0-9]{1}\/version/i)
				.reply(200, { version : 'test' });

			playback.version(function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});
});
