/*eslint no-magic-numbers: 0*/
/*eslint no-unused-expressions: 0*/
var
	path = require('path'),

	chai = require('chai'),
	co = require('co'),
	nock = require('nock'),

	ClaimProxy = require('../../lib/claim'),

	should = chai.should();


describe('claim', () => {
	'use strict';

	let
		claim,
		ensureAuthHeaders = function () {
			return new Promise((resolve, reject) => {
				return resolve({
					'x-client-id': 'test',
					'x-authentication-token': 'test'
				})
			})
		},
		mockClaims = {
			'mock-service-id': {
				'mock-key-1': 'mock-value-1',
				'mock-key-2': 'mock-value-2',
				'mock-key-3': 'mock-value-3'
			},
			'mock-service-id-2': {
				'mock-key-1': 'mock-value-1',
				'mock-key-2': 'mock-value-2',
				'mock-key-3': 'mock-value-3'
			}
		},
		requestInfo,
		responseInfo;

	afterEach(() => {
		requestInfo = undefined;
		responseInfo = undefined;
	});

	beforeEach(() => {
		claim = new ClaimProxy(null, ensureAuthHeaders);

		// capture request and response info
		claim.on('request', (info) => (requestInfo = info));
		claim.on('response', (info) => (responseInfo = info));
	});

	describe('ctor', () => {
		it('should properly construct', () => {
			let
				proxy1 = new ClaimProxy({
					host : 'one'
				}, 'test', 'test'),
				proxy2 = new ClaimProxy({
					host : 'two'
				}, 'test', 'test');

			proxy1.settings().host.should.not.equal(proxy2.settings().host);
		});

		it('should be constructable without options...', () => {
			let proxy = new ClaimProxy();
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
				proxy = new ClaimProxy(options, ensureAuthHeaders);

			should.exist(proxy.allClaims);
			should.exist(proxy.allClaimsForClient);
			should.exist(proxy.settings);
			proxy.settings().should.not.be.empty;
			proxy.settings().agent.should.equal(options.agent);
			proxy.settings().host.should.equal(options.host);
			proxy.settings().maxRetries.should.equal(options.maxRetries);
			proxy.settings().port.should.equal(options.port);
			proxy.settings().rejectUnauthorized.should.equal(options.rejectUnauthorized);
			proxy.settings().secure.should.equal(options.secure);
		});
	});

	describe('#allClaims', () => {
		const mockClientId = 'mock-client-id';
		const mockServiceId = 'mock-service-id';

		it('should properly retrieve all claims for a given client and service (promise)', (done) => {
			// intercept outbound request

			nock('https://claim-api.apps.playnetwork.com')
				.get(`/v0/clients/${mockClientId}/services/${mockServiceId}/claims`)
				.reply(200, { total : 0 });

			claim.allClaims(mockClientId, mockServiceId)
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});
	});

	describe('#allClaimsForClient', () => {
		const mockClientId = 'mock-client-id';

		it('should properly retrieve all claims for a given client (promise)', (done) => {
			// intercept outbound request

			nock('https://claim-api.apps.playnetwork.com')
				.get(`/v0/clients/${mockClientId}/claims`)
				.reply(200, { total : 0 });

			claim.allClaimsForClient(mockClientId)
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});
	});

	describe('#createClaims', () => {
		const mockClaims = {
			name : 'test claims'
		};
		const mockClientId = 'mock-client-id';
		const mockServiceId = 'mock-service-id';

		it('should require clientId (promise)', (done) => {
			claim.createClaims()
				.then(() => {
					return done(new Error('should require client'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('clientId is required');

					return done();
				})
		});

		it('should require serviceId (promise)', (done) => {
			claim.createClaims(mockClientId)
				.then(() => {
					return done(new Error('should require serviceId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('serviceId is required');

					return done();
				})
		});

		it('should require claim details (promise)', (done) => {
			claim.createClaims(mockClientId, mockServiceId)
				.then(() => {
					return done(new Error('should require claims'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('claims are required');

					return done();
				})
		});

		it('should require claim details (callback)', (done) => {
			claim.createClaims(mockClientId, mockServiceId, function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('claims are required');
				should.not.exist(result);

				return done();
			});
		});

		it('should properly create claims (promise)', (done) => {
			// intercept outbound request
			nock('https://claim-api.apps.playnetwork.com')
				.post(`/v0/clients/${mockClientId}/services/${mockServiceId}/claims`)
				.reply(201, mockClaims);

			claim.createClaims(mockClientId, mockServiceId, mockClaims)
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly create claims (callback)', (done) => {
			// intercept outbound request
			nock('https://claim-api.apps.playnetwork.com')
				.post(`/v0/clients/${mockClientId}/services/${mockServiceId}/claims`)
				.reply(201, mockClaims);

			claim.createClaims(mockClientId, mockServiceId, mockClaims, function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#updateClaims', () => {
		const mockClaims = {
			name : 'test claims'
		};
		const mockClientId = 'mock-client-id';
		const mockServiceId = 'mock-service-id';

		it('should require clientId (promise)', (done) => {
			claim.updateClaims()
				.then(() => {
					return done(new Error('should require client'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('clientId is required');

					return done();
				})
		});

		it('should require serviceId (promise)', (done) => {
			claim.updateClaims(mockClientId)
				.then(() => {
					return done(new Error('should require serviceId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('serviceId is required');

					return done();
				})
		});

		it('should require claim details (promise)', (done) => {
			claim.updateClaims(mockClientId, mockServiceId)
				.then(() => {
					return done(new Error('should require claims'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('claims are required');

					return done();
				})
		});

		it('should require claim details (callback)', (done) => {
			claim.updateClaims(mockClientId, mockServiceId, function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('claims are required');
				should.not.exist(result);

				return done();
			});
		});

		it('should properly update claims (promise)', (done) => {
			// intercept outbound request
			nock('https://claim-api.apps.playnetwork.com')
				.put(`/v0/clients/${mockClientId}/services/${mockServiceId}/claims`)
				.reply(202, mockClaims);

			claim.updateClaims(mockClientId, mockServiceId, mockClaims)
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly update claims (callback)', (done) => {
			// intercept outbound request
			nock('https://claim-api.apps.playnetwork.com')
				.put(`/v0/clients/${mockClientId}/services/${mockServiceId}/claims`)
				.reply(202, mockClaims);

			claim.updateClaims(mockClientId, mockServiceId, mockClaims, function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});
});
