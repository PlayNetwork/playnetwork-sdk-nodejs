/*eslint no-magic-numbers: 0*/
/*eslint no-unused-expressions: 0*/
var
	chai = require('chai'),
	co = require('co'),
	nock = require('nock'),

	BrandProxy = require('../../lib/brand'),

	should = chai.should();


describe('brand', () => {
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
		brand,
		requestInfo,
		responseInfo;

	afterEach(() => {
		requestInfo = undefined;
		responseInfo = undefined;
	});

	beforeEach(() => {
		brand = new BrandProxy(null, ensureAuthHeaders);

		// capture request and response info
		brand.on('request', (info) => (requestInfo = info));
		brand.on('response', (info) => (responseInfo = info));
	});

	describe('ctor', () => {
		it('should properly construct', () => {
			let
				proxy1 = new BrandProxy({
					host : 'one'
				}),
				proxy2 = new BrandProxy({
					host : 'two'
				});

			proxy1.settings().host.should.not.equal(proxy2.settings().host);
		});

		it('should be constructable without options...', () => {
			let proxy = new BrandProxy();
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
				proxy = new BrandProxy(options);

			should.exist(proxy.allBrands);
			should.exist(proxy.getBrand);
			should.exist(proxy.allCurationGroups);
			should.exist(proxy.getCurationGroup);
			should.exist(proxy.settings);
			should.exist(proxy.version);
			proxy.settings().should.not.be.empty;
			proxy.settings().agent.should.equal(options.agent);
			proxy.settings().host.should.equal(options.host);
			proxy.settings().port.should.equal(options.port);
			proxy.settings().rejectUnauthorized.should.equal(options.rejectUnauthorized);
			proxy.settings().secure.should.equal(options.secure);
		});
	});

	describe('#allBrands', () => {
		it('should properly retrieve all brands (promise)', (done) => {
			// intercept outbound request
			nock('https://master-brand-api.apps.playnetwork.com')
				.get('/v1/brands')
				.reply(200, { total : 0 });

			brand.allBrands()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve all brands (callback)', (done) => {
			// intercept outbound request
			nock('https://master-brand-api.apps.playnetwork.com')
				.get('/v1/brands')
				.reply(200, { total : 0 });

			brand.allBrands(function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly support query filters', (done) => {
			// intercept outbound request
			nock('https://master-brand-api.apps.playnetwork.com')
				.get(/\/v1\/brands[.]*/)
				.reply(200, { total : 0 });

				brand.allBrands(
				{
					filters : {
						mandatory : {
							exists : 'brandId'
						}
					}
				}).then((result) => {
					should.exist(result);
					should.exist(requestInfo);
					should.exist(requestInfo.query);
					should.exist(requestInfo.query['filters[mandatory][exists]']);
					requestInfo.query['filters[mandatory][exists]'].should.equal('brandId');

					return done();
				}).catch((err) => (done(err)));
		});
	});

	describe('#getBrand', () => {
		it('should require brandId', (done) => {
			brand.getBrand(function (err, result) {
				should.exist(err);
				should.not.exist(result);
				should.exist(err.message);
				err.message.should.equal('brandId is required');

				return done();
			});
		});

		it('should properly get a brand (promise)', (done) => {
			// intercept outbound request
			nock('https://master-brand-api.apps.playnetwork.com')
				.get('/v1/brands/test')
				.reply(200, { brandId : 'test' });

			brand.getBrand('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly get a brand (callback)', (done) => {
			// intercept outbound request
			nock('https://master-brand-api.apps.playnetwork.com')
				.get('/v1/brands/test')
				.reply(200, { brandId : 'test' });

			brand.getBrand('test', function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly support options', (done) => {
			// intercept outbound request
			nock('https://master-brand-api.apps.playnetwork.com')
				.get('/v1/brands/test?testing=yes')
				.reply(200, { locationId : 'test' });

			brand.getBrand('test', { testing : 'yes' }, function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#allCurationGroups', () => {
		it('should require brandId', (done) => {
			brand.allCurationGroups(function (err, result) {
				should.exist(err);
				should.not.exist(result);
				should.exist(err.message);
				err.message.should.equal('brandId is required');

				return done();
			});
		});

		it('should properly retrieve all curation groups (promise)', (done) => {
			// intercept outbound request
			nock('https://master-brand-api.apps.playnetwork.com')
				.get('/v1/brands/test/curationGroups')
				.reply(200, { total : 0 });

			brand.allCurationGroups('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve all curation groups (callback)', (done) => {
			// intercept outbound request
			nock('https://master-brand-api.apps.playnetwork.com')
				.get('/v1/brands/test/curationGroups')
				.reply(200, { total : 0 });

			brand.allCurationGroups('test', function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly support query filters', (done) => {
			// intercept outbound request
			nock('https://master-brand-api.apps.playnetwork.com')
				.get(/\/v1\/brands\/test\/curationGroups[.]*/)
				.reply(200, { total : 0 });

			brand.allCurationGroups(
				'test',
				{
					filters : {
						mandatory : {
							exists : 'brandId'
						}
					}
				}).then((result) => {
					should.exist(result);
					should.exist(requestInfo);
					should.exist(requestInfo.query);
					should.exist(requestInfo.query['filters[mandatory][exists]']);
					requestInfo.query['filters[mandatory][exists]'].should.equal('brandId');

					return done();
				}).catch((err) => (done(err)));
		});
	});


	describe('#getCurationGroup', () => {
		it('should require brandId', (done) => {
			brand.getCurationGroup(function (err, result) {
				should.exist(err);
				should.not.exist(result);
				should.exist(err.message);
				err.message.should.equal('brandId is required');

				return done();
			});
		});

		it('should require curationGroupId', (done) => {
			brand.getCurationGroup('test', function (err, result) {
				should.exist(err);
				should.not.exist(result);
				should.exist(err.message);
				err.message.should.equal('curationGroupId is required');

				return done();
			});
		});

		it('should properly get a brand (promise)', (done) => {
			// intercept outbound request
			nock('https://master-brand-api.apps.playnetwork.com')
				.get('/v1/brands/test/curationGroups/test2')
				.reply(200, { brandId : 'test' });

			brand.getCurationGroup('test', 'test2')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly get a brand (callback)', (done) => {
			// intercept outbound request
			nock('https://master-brand-api.apps.playnetwork.com')
				.get('/v1/brands/test/curationGroups/test2')
				.reply(200, { brandId : 'test' });

			brand.getCurationGroup('test', 'test2', function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly support options', (done) => {
			// intercept outbound request
			nock('https://master-brand-api.apps.playnetwork.com')
				.get('/v1/brands/test/curationGroups/test2?testing=yes')
				.reply(200, { locationId : 'test' });

			brand.getCurationGroup('test', 'test2', { testing : 'yes' }, function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#version', () => {
		it('should properly return version (promise)', (done) => {
			// intercept outbound request
			nock('https://master-brand-api.apps.playnetwork.com')
				.get(/\/v[0-9]{1}\/version/i)
				.reply(200, { version : 'test' });

			brand.version()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});

		it('should properly return version (callback)', (done) => {
			// intercept outbound request
			nock('https://master-brand-api.apps.playnetwork.com')
				.get(/\/v[0-9]{1}\/version/i)
				.reply(200, { version : 'test' });

			brand.version(function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});
});
