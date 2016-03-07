/*eslint no-magic-numbers: 0*/
/*eslint no-unused-expressions: 0*/
var
	chai = require('chai'),
	co = require('co'),
	nock = require('nock'),

	ContentProxy = require('../../lib/content'),

	should = chai.should();


describe('content', () => {
	'use strict';

	let
		ensureAuthHeaders = new Promise((resolve, reject) => {
			return resolve({
				'x-client-id': 'test',
				'x-authentication-token': 'test'
			})
		}),
		content,
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
					host : 'develop-test-api.apps.playnetwork.com',
					secure : true
				},
				proxy = new ContentProxy(options);

			should.exist(proxy.checkAsset);
			should.exist(proxy.checkLegacyAsset);
			should.exist(proxy.getAssetStream);
			should.exist(proxy.getLegacyAssetStream);
			should.exist(proxy.settings);
			proxy.settings().should.not.be.empty;
			proxy.settings().host.should.equal(options.host);
			proxy.settings().secure.should.equal(options.secure);
		});
	});

	describe('#checkAsset', () => {
		it('should require track', (done) => {
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
		it('should require track', (done) => {
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
				.head('/v0/legacy/assets/tracktoken:12345')
				.reply(200);

			content.checkLegacyAsset('tracktoken:12345')
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
				.head('/v0/legacy/assets/tracktoken:12345')
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
});
