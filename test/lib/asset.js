/*eslint no-magic-numbers: 0*/
/*eslint no-unused-expressions: 0*/
var
	chai = require('chai'),
	co = require('co'),
	nock = require('nock'),
	AssetProxy = require('../../lib/asset'),
	should = chai.should();

describe('asset', function () {
	'use strict';

	let
		asset,
		ensureAuthHeaders = function () {
			return new Promise((resolve, reject) => {
				return resolve({
					'x-client-id': 'test',
					'x-authentication-token': 'test'
				})
			})
		},
		requestInfo,
		responseInfo;

	afterEach(() => {
		requestInfo = undefined;
		responseInfo = undefined;
	});

	beforeEach(() => {
		asset = new AssetProxy(null, ensureAuthHeaders);

		// capture request and response info
		asset.on('request', (info) => (requestInfo = info));
		asset.on('response', (info) => (responseInfo = info));
	});

	describe('ctor', function () {
		it('should properly construct', function () {
			let
				proxy1 = new AssetProxy({
					host : 'one'
				}),
				proxy2 = new AssetProxy({
					host : 'two'
				});

			proxy1.settings().host.should.not.equal(proxy2.settings().host);
		});

		it('should be constructable without options...', function () {
			let proxy = new AssetProxy();
			proxy.settings().should.not.be.empty;
			should.exist(proxy.settings().host);
			should.exist(proxy.settings().secure);
		});

		it('should be constructable with options...', function () {
			let
				options = {
					agent : { proxy : true },
					host : 'develop-test-api.apps.playnetwork.com',
					maxRetries : 1,
					port : 8080,
					rejectUnauthorized : true,
					secure : true
				},
				proxy = new AssetProxy(options);

			should.exist(proxy.createOriginal);
			should.exist(proxy.getAssetStream);
			should.exist(proxy.updateOriginal);
			should.exist(proxy.upsertAssets);
			should.exist(proxy.settings);
			proxy.settings().should.not.be.empty;
			proxy.settings().agent.should.equal(options.agent);
			proxy.settings().host.should.equal(options.host);
			proxy.settings().port.should.equal(options.port);
			proxy.settings().rejectUnauthorized.should.equal(options.rejectUnauthorized);
			proxy.settings().secure.should.equal(options.secure);
		});
	});

	describe('#call', function () {
		beforeEach(function () {
			// override ensureAuthHeaders
			asset.ensureAuthHeaders = function () {
				return new Promise((resolve, reject) => {
					return resolve({
						'x-client-id': 'test',
						'x-authentication-token': 'test'
					})
				})
			};
		});

		it('should require options (callback)', function (done) {
			asset.call(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.equal('options are required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require options (promise)', function (done) {
			asset
				.call()
				.then(() => done(new Error('should require options')))
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.equal('options are required');

					return done();
				});
		});

		it('should require options.pathname (callback)', function (done) {
			asset.call({ method : 'get' }, function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.equal('options.pathname is required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require options.pathname (promise)', function (done) {
			asset
				.call({ method : 'get' })
				.then(() => done(new Error('should require options.pathname')))
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.equal('options.pathname is required');

					return done();
				});
		});

		it('should default options.method (callback)', function (done) {
			// intercept outbound request
			nock('https://master-assetapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.get('/v0/test')
				.reply(200, { test : true });

			asset.call({ pathname : '/v0/test' }, function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should default invalid options.method (promise)', function (done) {
			// intercept outbound request
			nock('https://master-assetapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.get('/v0/test')
				.reply(200, { test : true });

			asset
				.call({ pathname : '/v0/test', method : { invalid : true } })
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});

		it('should lowercase options.method (promise)', function (done) {
			// intercept outbound request
			nock('https://master-assetapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.put('/v0/test')
				.reply(202, { test : true });

			asset
				.call({ pathname : '/v0/test', method : 'PUT' })
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});

		it('should accept options.data', function (done) {
			let data = { test : true };

			// intercept outbound request
			nock('https://master-assetapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.post('/v0/test', data)
				.reply(201, data);

			asset
				.call({ pathname : '/v0/test', method : 'POST', data : data })
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});
	});

	describe('#checkOriginal', function () {
		it('should require originalId (promise)', function (done) {
			asset.checkOriginal()
				.then(() => {
					return done(new Error('should require originalId'));
				})
				.catch((err) => {
					should.exist(err);
					return done();
				});
		});

		it('should require originalId (callback)', function (done) {
			asset.checkOriginal(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('originalId is required');
				should.not.exist(result);
				return done();
			});
		});
	});

	describe('#createOriginal', function () {
		it('should require original (promise)', function (done) {
			asset.createOriginal()
				.then(() => {
					return done(new Error('should require original'));
				})
				.catch((err) => {
					should.exist(err);
					return done();
				});
		});

		it('should require original (callback)', function (done) {
			asset.createOriginal(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('original is required');
				should.not.exist(result);
				return done();
			});
		});

		it('should require originalId', function (done) {
			asset.createOriginal({ bitrate : 196000 })
				.then(() => {
					return done(new Error('should require originalId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('originalId is required');

					return done();
				});
		});
	});

	describe('#getAssetStream', function () {
		it('should require asset (promise)', function (done) {
			asset.getAssetStream()
				.then(() => {
					return done(new Error('should require asset'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('asset is required');

					return done();
				});
		});

		it('should require asset (callback)', function (done) {
			asset.getAssetStream(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('asset is required');
				should.not.exist(result);

				return done();
			});
		});
	});

	describe('#getOriginalByAsset', function () {
		it('should require asset (promise)', function (done) {
			asset.getOriginalByAsset()
				.then(() => {
					return done(new Error('should require asset'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('asset is required');

					return done();
				});
		});

		it('should require asset (callback)', function (done) {
			asset.getOriginalByAsset(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('asset is required');
				should.not.exist(result);

				return done();
			});
		});
	});

	describe('#updateOriginal', function () {
		it('should require original (promise)', function (done) {
			asset.updateOriginal()
				.then(() => {
					return done(new Error('should require original'));
				})
				.catch((err) => {
					should.exist(err);
					return done();
				});
		});

		it('should require original (callback)', function (done) {
			asset.updateOriginal(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('original is required');
				should.not.exist(result);
				return done();
			});
		});

		it('should require originalId', function (done) {
			asset.updateOriginal({ bitrate : 196000 })
				.then(() => {
					return done(new Error('should require originalId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('originalId is required');

					return done();
				});
		});
	});

	it('#upsertAssets', function () {
		it('should require assets (promise)', function (done) {
			asset.upsertAssets()
				.then(() => {
					return done(new Error('should require assets'));
				})
				.catch((err) => {
					should.exist(err);
					return done();
				});
		});

		it('should require assets (callback)', function (done) {
			asset.upsertAssets(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('assets are required');
				should.not.exist(result);
				return done();
			});
		});
	});

	it('#upsertOriginals', function () {
		it('should require originals (promise)', function (done) {
			asset.upsertOriginals()
				.then(() => {
					return done(new Error('should require originals'));
				})
				.catch((err) => {
					should.exist(err);
					return done();
				});
		});

		it('should require originals (callback)', function (done) {
			asset.upsertOriginals(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('originals are required');
				should.not.exist(result);
				return done();
			});
		});
	});

	describe('#version', () => {
		it('should properly return version (promise)', (done) => {
			// intercept outbound request
			nock('https://master-assetapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.get(/\/v[0-9]{1}\/version/i)
				.reply(200, { version : 'test' });

			asset.version()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});

		it('should properly return version (callback)', (done) => {
			// intercept outbound request
			nock('https://master-assetapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.get(/\/v[0-9]{1}\/version/i)
				.reply(200, { version : 'test' });

			asset.version(function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});
});
