/*eslint no-magic-numbers: 0*/
/*eslint no-unused-expressions: 0*/
var
	stream = require('stream'),

	chai = require('chai'),
	co = require('co'),
	nock = require('nock'),

	ContentProxy = require('../../lib/content'),

	should = chai.should();


describe('content', () => {
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
		content,
		getMockStream = function (statusCode) {
			let contentStream = new stream.Readable();
			contentStream.headers = {};
			contentStream.statusCode = statusCode || 200;
			contentStream._read = () => {};

			return contentStream;
		},
		requestInfo,
		responseInfo;

	afterEach(() => {
		requestInfo = undefined;
		responseInfo = undefined;
	});

	beforeEach(() => {
		content = new ContentProxy(null, ensureAuthHeaders);

		// capture request and response info
		content.on('request', (info) => (requestInfo = info));
		content.on('response', (info) => (responseInfo = info));
	});

	describe('ctor', () => {
		it('should properly construct', () => {
			let
				proxy1 = new ContentProxy({
					host : 'one'
				}),
				proxy2 = new ContentProxy({
					host : 'two'
				});

			proxy1.settings().host.should.not.equal(proxy2.settings().host);
		});

		it('should be constructable without options...', () => {
			let proxy = new ContentProxy();
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
				proxy = new ContentProxy(options);

			should.exist(proxy.checkAsset);
			should.exist(proxy.checkLegacyAsset);
			should.exist(proxy.getAssetStream);
			should.exist(proxy.getLegacyAssetStream);
			should.exist(proxy.settings);
			proxy.settings().should.not.be.empty;
			proxy.settings().agent.should.equal(options.agent);
			proxy.settings().host.should.equal(options.host);
			proxy.settings().port.should.equal(options.port);
			proxy.settings().rejectUnauthorized.should.equal(options.rejectUnauthorized);
			proxy.settings().secure.should.equal(options.secure);
		});
	});

	describe('#buildTrackAlias', () => {
		it('should return an empty value if called with an empty value', () => {
			should.not.exist(content.buildTrackAlias());
		});

		it('should return an assetId string', () => {
			let assetId = 'abc123xyz098';
			content.buildTrackAlias(assetId).should.equal(assetId);
		});

		it('should properly format a number input as a string', () => {
			let trackToken = '123456';
			content
				.buildTrackAlias(trackToken)
				.should.equal(['trackToken', trackToken].join(':'));
		});

		it('should properly format a number input as a number', () => {
			let trackToken = 123456;
			content
				.buildTrackAlias(trackToken)
				.should.equal(['trackToken', trackToken].join(':'));
		});

		it('should properly return a pre-formatted trackToken alias', () => {
			let trackAlias = ['trackToken', 123456].join(':');
			content.buildTrackAlias(trackAlias).should.equal(trackAlias);
		});

		it('should properly return a trackToken alias when track is object', () => {
			let track = {
				legacy : {
					trackToken : 123456
				}
			};

			content
				.buildTrackAlias(track)
				.should.equal(['trackToken', track.legacy.trackToken].join(':'));
		});

		it('should properly return a trackToken alias when track is object and assetId is also supplied', () => {
			let track = {
				assetId : 'abc123xyz098',
				legacy : {
					trackToken : 123456
				}
			};

			content
				.buildTrackAlias(track)
				.should.equal(['trackToken', track.legacy.trackToken].join(':'));
		});

		it('should properly return assetId when track is object', () => {
			let track = {
				assetId : 'abc123xyz098'
			};

			content
				.buildTrackAlias(track)
				.should.equal(track.assetId);
		});
	});

	describe('#call', () => {
		beforeEach(() => {
			// override ensureAuthHeaders
			content.ensureAuthHeaders = function () {
				return new Promise((resolve, reject) => {
					return resolve({
						'x-client-id': 'test',
						'x-authentication-token': 'test'
					})
				})
			};
		});

		it('should require options (callback)', (done) => {
			content.call(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.equal('options are required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require options (promise)', (done) => {
			content
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
			content.call({ method : 'get' }, function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.equal('options.pathname is required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require options.pathname (promise)', (done) => {
			content
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
			nock('https://content-api.apps.playnetwork.com')
				.get('/v0/test')
				.reply(200, { test : true });

			content.call({ pathname : '/v0/test' }, function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should default invalid options.method (promise)', (done) => {
			// intercept outbound request
			nock('https://content-api.apps.playnetwork.com')
				.get('/v0/test')
				.reply(200, { test : true });

			content
				.call({ pathname : '/v0/test', method : { invalid : true } })
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});

		it('should lowercase options.method (promise)', (done) => {
			// intercept outbound request
			nock('https://content-api.apps.playnetwork.com')
				.put('/v0/test')
				.reply(202, { test : true });

			content
				.call({ pathname : '/v0/test', method : 'PUT' })
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
			nock('https://content-api.apps.playnetwork.com')
				.post('/v0/test', data)
				.reply(201, data);

			content
				.call({ pathname : '/v0/test', method : 'POST', data : data })
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});
	});

	describe('#checkAsset', () => {
		it('should require track (promise)', (done) => {
			content.checkAsset()
				.then(() => {
					return done(new Error('should require track'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('track is required');

					return done();
				});
		});

		it('should require track (callback)', (done) => {
			content.checkAsset(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('track is required');
				should.not.exist(result);

				return done();
			});
		});

		it('should redirect to legacy if asset is not specified', (done) => {
			content.checkAsset({ test : true }, function (err, result) {
				should.not.exist(result);
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('track is missing identifier');

				return done();
			});
		});

		it('should properly check asset (promise)', (done) => {
			// intercept outbound request
			nock('https://content-api.apps.playnetwork.com')
				.head('/v0/assets/test')
				.reply(200);

			content.checkAsset('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);
					result.should.be.true;

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly check asset (callback)', (done) => {
			// intercept outbound request
			nock('https://content-api.apps.playnetwork.com')
				.head('/v0/assets/test')
				.reply(404);

			content.checkAsset({ assetId : 'test' }, function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);
				result.should.be.false;

				return done();
			});
		});
	});

	describe('#checkLegacyAsset', () => {
		it('should require track (promise)', (done) => {
			content.checkLegacyAsset()
				.then(() => {
					return done(new Error('should require track'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('track is required');

					return done();
				});
		});

		it('should require track (callback)', (done) => {
			content.checkLegacyAsset(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('track is required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require legacy trackToken', (done) => {
			content.checkLegacyAsset({ test : true }, function (err, result) {
				should.not.exist(result);
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('track is missing identifier');

				return done();
			});
		});

		it('should properly check legacy asset (promise)', (done) => {
			// intercept outbound request
			nock('https://content-api.apps.playnetwork.com')
				.head('/v0/legacy/assets/trackToken:12345')
				.reply(200);

			content.checkLegacyAsset('trackToken:12345')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);
					result.should.be.true;

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly check legacy asset when not formatted with trackToken prefix (promise)', (done) => {
			// intercept outbound request
			nock('https://content-api.apps.playnetwork.com')
				.head('/v0/legacy/assets/trackToken:12345')
				.reply(200);

			content.checkLegacyAsset('12345')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);
					result.should.be.true;

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly check legacy asset (callback)', (done) => {
			// intercept outbound request
			nock('https://content-api.apps.playnetwork.com')
				.head('/v0/legacy/assets/trackToken:12345')
				.reply(404);

			content.checkLegacyAsset(
				{ legacy : { trackToken : 12345 } },
				function (err, result) {
					should.not.exist(err);
					should.exist(result);
					should.exist(requestInfo);
					result.should.be.false;

					return done();
				});
		});
	});

	describe('#getAssetStream', () => {
		it('should require track (promise)', (done) => {
			content.getAssetStream()
				.then(() => {
					return done(new Error('should require track'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('track is required');

					return done();
				});
		});

		it('should require track (callback)', (done) => {
			content.getAssetStream(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('track is required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require track identifier', (done) => {
			content.getAssetStream({ test : true })
				.then(() => {
					return done(new Error('should require track identifier'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('track is missing identifier');

					return done();
				});
		});

		it('should properly fail when content is not found', (done) => {
			// intercept outbound request
			nock('https://content-api.apps.playnetwork.com')
				.get('/v0/assets/test')
				.reply(404, { statusCode : 404 });

			content.getAssetStream('test')
				.then(() => {
					return done(new Error('should fail when content is not found'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('resource not found');

					return done();
				});
		});

		it('should properly redirect to legacy when assetId is not supplied', (done) => {
			// intercept outbound request
			nock('https://content-api.apps.playnetwork.com')
				.get('/v0/legacy/assets/trackToken:1234')
				.reply(200, getMockStream(200));

			content.getAssetStream({ legacy : { trackToken : 1234 }})
				.then((result) => {
					should.exist(result);
					return done();
				})
				.catch(done);
		});

		it('should properly return stream when content is found (promise)', (done) => {
			// intercept outbound request
			nock('https://content-api.apps.playnetwork.com')
				.get('/v0/assets/test')
				.reply(200, getMockStream(200));

			content.getAssetStream('test')
				.then((result) => {
					should.exist(result);
					return done();
				})
				.catch(done);
		});

		it('should properly return stream when content is found (callback)', (done) => {
			// intercept outbound request
			nock('https://content-api.apps.playnetwork.com')
				.get('/v0/assets/test')
				.reply(200, getMockStream(200));

			content.getAssetStream({ assetId : 'test' }, function (err, result) {
				should.not.exist(err);
				should.exist(result);

				return done();
			});
		});
	});

	describe('#getLegacyAssetStream', () => {
		it('should require track (promise)', (done) => {
			content.getLegacyAssetStream()
				.then(() => {
					return done(new Error('should require track'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('track is required');

					return done();
				});
		});

		it('should require track (callback)', (done) => {
			content.getLegacyAssetStream(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('track is required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require track identifier', (done) => {
			content.getLegacyAssetStream({ test : true })
				.then(() => {
					return done(new Error('should require track identifier'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('track is missing identifier');

					return done();
				});
		});

		it('should properly fail when content is not found', (done) => {
			// intercept outbound request
			nock('https://content-api.apps.playnetwork.com')
				.get('/v0/legacy/assets/test')
				.reply(404, { statusCode : 404 });

			content.getLegacyAssetStream('test')
				.then(() => {
					return done(new Error('should fail when content is not found'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('resource not found');

					return done();
				});
		});

		it('should properly return stream when content is found (promise)', (done) => {
			// intercept outbound request
			nock('https://content-api.apps.playnetwork.com')
				.get('/v0/legacy/assets/test')
				.reply(200, getMockStream(200));

			content.getLegacyAssetStream('test')
				.then((result) => {
					should.exist(result);
					return done();
				})
				.catch(done);
		});

		it('should properly return stream when content is found (callback)', (done) => {
			// intercept outbound request
			nock('https://content-api.apps.playnetwork.com')
				.get('/v0/legacy/assets/trackToken:1234')
				.reply(200, getMockStream(200));

			content.getLegacyAssetStream(
				{ legacy : { trackToken: 1234 } },
				function (err, result) {
					should.not.exist(err);
					should.exist(result);

					return done();
			});
		});
	});

	describe('#version', () => {
		it('should properly return version (promise)', (done) => {
			// intercept outbound request
			nock('https://content-api.apps.playnetwork.com')
				.get(/\/v[0-9]{1}\/version/i)
				.reply(200, { version : 'test' });

			content.version()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});

		it('should properly return version (callback)', (done) => {
			// intercept outbound request
			nock('https://content-api.apps.playnetwork.com')
				.get(/\/v[0-9]{1}\/version/i)
				.reply(200, { version : 'test' });

			content.version(function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});
});
