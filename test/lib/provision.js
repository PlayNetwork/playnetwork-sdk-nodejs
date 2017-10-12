/*eslint no-magic-numbers: 0*/
/*eslint no-unused-expressions: 0*/
var
	chai = require('chai'),
	co = require('co'),
	nock = require('nock'),

	ProvisionProxy = require('../../lib/provision'),

	should = chai.should();


describe('provision', () => {
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
		provision,
		requestInfo,
		responseInfo;

	afterEach(() => {
		requestInfo = undefined;
		responseInfo = undefined;
	});

	beforeEach(() => {
		provision = new ProvisionProxy(null, ensureAuthHeaders);

		// capture request and response info
		provision.on('request', (info) => {
			requestInfo = info;
			return requestInfo;
		});

		provision.on('response', (info) => (responseInfo = info));
	});

	describe('ctor', () => {
		it('should properly construct', () => {
			let
				proxy1 = new ProvisionProxy({
					host : 'one'
				}),
				proxy2 = new ProvisionProxy({
					host : 'two'
				});

			proxy1.settings().host.should.not.equal(proxy2.settings().host);
		});

		it('should be constructable without options...', () => {
			let proxy = new ProvisionProxy();
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
				proxy = new ProvisionProxy(options);

			should.exist(proxy.getClientCreds);
			should.exist(proxy.getApplications);
			proxy.settings().should.not.be.empty;
			proxy.settings().agent.should.equal(options.agent);
			proxy.settings().host.should.equal(options.host);
			proxy.settings().port.should.equal(options.port);
			proxy.settings().rejectUnauthorized.should.equal(options.rejectUnauthorized);
			proxy.settings().secure.should.equal(options.secure);
		});
	});

	describe('#getClientCreds', () => {
		it('should properly retrieve credentials (promise)', (done) => {
			// intercept outbound request
			nock('https://provision-api.apps.playnetwork.com')
				.get('/v2/devices/:5/activation')
				.reply(200, {} );

			provision.getClientCreds('5')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should reject with error without device id ', (done) => {
			// intercept outbound request
			nock('https://provision-api.apps.playnetwork.com')
				.get('/v2/devices/:5/activation')
				.reply(200, {} );

			provision.getClientCreds()
				.then((result) => {
					return done(new Error('should have rejected'))
				})
				.catch((err) => {
					err.message.should.equals('deviceId is required');
					return done();
				})
		});
});

	describe('#getApplications', () => {
		it('should return a list of apps', (done) => {
			// intercept outbound request
			nock('https://provision-api.apps.playnetwork.com')
				.get('/v2/devices')
				.reply(200, ['app1', 'app2', 'app3'] );

			provision.getApplications()
			  .then((result) => {
					should.exist(result);

					return done();
				})
				.catch((err) => (done(err)));
		});
	});

	describe('#version', () => {
		it('should properly return version', (done) => {
			// intercept outbound request
			nock('https://provision-api.apps.playnetwork.com')
				.get(/\/v[0-9]{1}\/version/i)
				.reply(200, { version : 'test' });

			provision.version()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});
	});
});
