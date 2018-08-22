/*eslint no-magic-numbers: 0*/
/*eslint no-unused-expressions: 0*/
var
	chai = require('chai'),
	co = require('co'),
	nock = require('nock'),

	TrackProxy = require('../../lib/track'),

	should = chai.should();

describe('track', () => {
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
		track,
		requestInfo,
		responseInfo;

	afterEach(() => {
		requestInfo = undefined;
		responseInfo = undefined;
	});

	beforeEach(() => {
		track = new TrackProxy(null, ensureAuthHeaders);

		// capture request and response info
		track.on('request', (info) => (requestInfo = info));
		track.on('response', (info) => (responseInfo = info));
	});

	describe('ctor', () => {
		it('should properly construct', () => {
			let
				proxy1 = new TrackProxy({
					host : 'one'
				}),
				proxy2 = new TrackProxy({
					host : 'two'
				});

			proxy1.settings().host.should.not.equal(proxy2.settings().host);
		});

		it('should be constructable without options...', () => {
			let proxy = new TrackProxy();
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
				proxy = new TrackProxy(options);

			should.exist(proxy.allTracks);
			should.exist(proxy.getTrack);
			should.exist(proxy.getTracks);
			should.exist(proxy.settings);
			proxy.settings().should.not.be.empty;
			proxy.settings().agent.should.equal(options.agent);
			proxy.settings().host.should.equal(options.host);
			proxy.settings().port.should.equal(options.port);
			proxy.settings().rejectUnauthorized.should.equal(options.rejectUnauthorized);
			proxy.settings().secure.should.equal(options.secure);
		});
	});

	describe('#allTracks', () => {
		it('should properly retrieve all tracks (promise)', (done) => {
			// intercept outbound request
			nock('https://master-trackapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.get('/v3/tracks')
				.reply(200, { total : 0 });

			track.allTracks()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve all tracks (callback)', (done) => {
			// intercept outbound request
			nock('https://master-trackapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.get('/v3/tracks')
				.reply(200, { total : 0 });

			track.allTracks((err, result) => {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});	
		});

		it('should properly support query filters', (done) => {
			// intercept outbound request
			nock('https://master-trackapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.get(/\/v3\/tracks[.]*/)
				.reply(200, { total : 0 });

			track.allTracks({
				filters : {
					mandatory : {
						exact : {
							'title' : 'test'
						}
					}
				}
			}).then((result) => {
				should.exist(result);
				should.exist(requestInfo);
				should.exist(requestInfo.query);
				should.exist(requestInfo.query['filters[mandatory][exact][title]']);
				requestInfo.query['filters[mandatory][exact][title]'].should.equal('test');

				return done();
			}).catch((err) => (done(err)));
		});
	});

	describe('#call', () => {
		beforeEach(() => {
			// override ensureAuthHeaders
			track.ensureAuthHeaders = () => {
				return new Promise((resolve, reject) => {
					return resolve({
						'x-client-id': 'test',
						'x-authentication-token': 'test'
					})
				})
			};
		});

		it('should require options (callback)', (done) => {
			track.call((err, result) => {
				should.exist(err);
				should.exist(err.message);
				err.message.should.equal('options are required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require options (promise)', (done) => {
			track
				.call()
				.then(() => done(new Error('should require options')))
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.equal('options are required');

					return done();
				});
		});

		it('should require options.pathname (callback)', (done) => {
			track.call({ method : 'get' }, (err, result) => {
				should.exist(err);
				should.exist(err.message);
				err.message.should.equal('options.pathname is required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require options.pathname (promise)', (done) => {
			track
				.call({ method : 'get' })
				.then(() => done(new Error('should require options.pathname')))
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.equal('options.pathname is required');

					return done();
				});
		});

		it('should default options.method (callback)', (done) => {
			// intercept outbound request
			nock('https://master-trackapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.get('/v3/test')
				.reply(200, { test : true });

			track.call({ pathname : '/v3/test' }, (err, result) => {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should default invalid options.method (promise)', (done) => {
			// intercept outbound request
			nock('https://master-trackapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.get('/v3/test')
				.reply(200, { test : true });

			track
				.call({ pathname : '/v3/test', method : { invalid : true } })
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});

		it('should lowercase options.method (promise)', (done) => {
			// intercept outbound request
			nock('https://master-trackapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.put('/v3/test')
				.reply(202, { test : true });

			track
				.call({ pathname : '/v3/test', method : 'PUT' })
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});

		it('should accept options.data', (done) => {
			let data = { test : true };

			// intercept outbound request
			nock('https://master-trackapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.post('/v3/test', data)
				.reply(201, data);

			track
				.call({ pathname : '/v3/test', method : 'POST', data : data })
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});
	});

	describe('#getTrack', () => {
		it('should require trackAlias (promise)', (done) => {
			track.getTrack()
				.then(() => {
					return done(new Error('should require trackAlias'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('trackAlias is required');

					return done();
				});
		});

		it('should require trackAlias (callback)', (done) => {
			track.getTrack((err, result) => {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('trackAlias is required');
				should.not.exist(result);

				return done();
			});
		});

		it('should properly retrieve track (promise)', (done) => {
			// intercept outbound request
			nock('https://master-trackapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.get('/v3/tracks/test')
				.reply(200, { total : 0 });

			track.getTrack('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve track (callback)', (done) => {
			// intercept outbound request
			nock('https://master-trackapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.get('/v3/tracks/test')
				.reply(200, { total : 0 });

			track.getTrack('test', (err, result) => {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#getTracks', () => {
		let mockTracks = ['trackId:test', 'isrc:ABC'];

		it('should require tracks (callback)', (done) => {
			track.getTracks((err, result) => {
				should.not.exist(result);
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('tracks are required');

				return done();
			});
		});

		it('should convert one track to array (promise)', (done) => {
			// intercept outbound request
			nock('https://master-trackapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.post('/v3/tracks/aliases')
				.reply(200, mockTracks);

			track.getTracks(mockTracks[0])
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly get multiple tracks (promise)', (done) => {
			// intercept outbound request
			nock('https://master-trackapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.post('/v3/tracks/aliases')
				.reply(200, mockTracks);

			track.getTracks(mockTracks)
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly get multiple tracks (callback)', (done) => {
			// intercept outbound request
			nock('https://master-trackapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.post('/v3/tracks/aliases')
				.reply(200, mockTracks);

			track.getTracks(mockTracks, (err, result) => {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});
});