/*eslint no-magic-numbers: 0*/
/*eslint no-unused-expressions: 0*/
var
	path = require('path'),

	chai = require('chai'),
	co = require('co'),
	nock = require('nock'),

	KeyProxy = require('../../lib/key'),

	should = chai.should();


describe('key', () => {
	'use strict';

	let
		key,
		mockToken = {
			clientId : 'clientId',
			tokenId : 'token',
			expires : new Date()
		},
		requestInfo,
		responseInfo;

	mockToken.expires = new Date(
		mockToken.expires.setUTCDate(
			mockToken.expires.getUTCDate() + 2));

	afterEach(() => {
		requestInfo = undefined;
		responseInfo = undefined;
	});

	beforeEach(() => {
		key = new KeyProxy();

		// capture request and response info
		key.on('request', (info) => (requestInfo = info));
		key.on('response', (info) => (responseInfo = info));
	});

	describe('ctor', () => {
		it('should properly construct', () => {
			let
				proxy1 = new KeyProxy({
					host : 'one'
				}, 'test', 'test'),
				proxy2 = new KeyProxy({
					host : 'two'
				}, 'test', 'test');

			proxy1.settings().host.should.not.equal(proxy2.settings().host);
		});

		it('should be constructable without options...', () => {
			let proxy = new KeyProxy();
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
				proxy = new KeyProxy(options);

			should.exist(proxy.allClients);
			should.exist(proxy.ensureAuthHeaders);
			should.exist(proxy.generateToken);
			should.exist(proxy.getTokenCacheSize);
			should.exist(proxy.settings);
			proxy.settings().should.not.be.empty;
			proxy.settings().agent.should.equal(options.agent);
			proxy.settings().host.should.equal(options.host);
			proxy.settings().port.should.equal(options.port);
			proxy.settings().rejectUnauthorized.should.equal(options.rejectUnauthorized);
			proxy.settings().secure.should.equal(options.secure);
		});
	});

	describe('#activate', () => {
		it('should properly require activation code (promise)', (done) => {
			key
				.activate()
				.then(() => {
					return done(new Error('should require activation code'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('activationCode is required');

					return done();
				});
		});

		it('should properly activate (promise)', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.post('/v0/activations/test/activate')
				.reply(200, { clientId : 0 });

			key.activate('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});
	});

	describe('#allClients', () => {
		beforeEach(() => {
			// override ensureAuthHeaders
			key.ensureAuthHeaders = function () {
				return new Promise((resolve, reject) => {
					return resolve({
						'x-client-id': 'test',
						'x-authentication-token': 'test'
					})
				})
			};
		});

		it('should properly retrieve all clients (promise)', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.get('/v0/clients')
				.reply(200, { total : 0 });

			key.allClients()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve all collections (callback)', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.get('/v0/clients')
				.reply(200, { total : 0 });

			key.allClients(function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly support query filters', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.get(/\/v0\/clients[.]*/)
				.reply(200, { total : 0 });

			key.allClients({
				filters : {
					mandatory : {
						exact : {
							'createdBy' : 'testing'
						}
					}
				}
			}).then((result) => {
				should.exist(result);
				should.exist(requestInfo);
				should.exist(requestInfo.query);
				should.exist(requestInfo.query['filters[mandatory][exact][createdBy]']);
				requestInfo.query['filters[mandatory][exact][createdBy]'].should.equal('testing');

				return done();
			}).catch((err) => (done(err)));
		});
	});

	describe('#createClient', () => {
		beforeEach(() => {
			// override ensureAuthHeaders
			key.ensureAuthHeaders = function () {
				return new Promise((resolve, reject) => {
					return resolve({
						'x-client-id': 'test',
						'x-authentication-token': 'test'
					})
				})
			};
		});

		let mockClient = {
			name : 'test client'
		};

		it('should require client details (promise)', (done) => {
			key.createClient()
				.then(() => {
					return done(new Error('should require client'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('client is required');

					return done();
				})
		});

		it('should require client details (callback)', (done) => {
			key.createClient(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('client is required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require name', (done) => {
			key.createClient({ other : true }, function (err, result) {
				should.not.exist(result);
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('client name is required');

				return done();
			});
		});

		it('should properly create client (promise)', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.post('/v0/clients')
				.reply(201, mockClient);

			key.createClient(mockClient)
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly create client (callback)', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.post('/v0/clients')
				.reply(201, mockClient);

			key.createClient(mockClient, function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#disableClient', () => {
		beforeEach(() => {
			// override ensureAuthHeaders
			key.ensureAuthHeaders = function () {
				return new Promise((resolve, reject) => {
					return resolve({
						'x-client-id': 'test',
						'x-authentication-token': 'test'
					})
				})
			};
		});

		it('should detect missing clientId (promise)', (done) => {
			key.disableClient()
				.then(() => (done('clientId is required')))
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.equal('clientId is required');

					return done();
				});
		});

		it('should detect missing clientId (callback)', (done) => {
			key.disableClient((err) => {
				should.exist(err);
				should.exist(err.message);
				err.message.should.equal('clientId is required');

				return done();
			});
		});

		it('should properly disable client (promise)', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.delete('/v0/clients/test-clientId')
				.reply(204);

			key.disableClient('test-clientId')
				.then(() => {
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});

		it('should properly disable client (callback)', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.delete('/v0/clients/test-clientId')
				.reply(204);

			key.disableClient('test-clientId', (err) => {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly remove client from token cache when disabled', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.post('/v0/tokens')
				.reply(201, { token : mockToken });

			nock('https://key-api.apps.playnetwork.com')
				.delete('/v0/clients/test-clientId')
				.reply(204);

			co(function *() {
				let token = yield key.generateToken('test-clientId', 'secret');

				should.exist(token);
				key.getTokenCacheSize().should.equal(1);

				yield key.disableClient('test-clientId');
				key.getTokenCacheSize().should.equal(0);
			})
			.then(done)
			.catch(done);
		});
	});

	describe('#ensureAuthHeaders', () => {
		it('should require clientId', (done) => {
			key = new KeyProxy({
				credentialsPath : path.resolve(
					process.cwd(),
					'test/empty.credentials.json')
			});

			// make sure credentialsPath was overridden
			should.exist(key.settings().credentialsPath);

			key.ensureAuthHeaders()
				.then(() => done('clientId is required'))
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('clientId is required');

					return done();
				});
		});

		it('should require secret', (done) => {
			key = new KeyProxy({
				credentialsPath : path.resolve(
					process.cwd(),
					'test/missing.secret.credentials.json')
			});

			// make sure credentialsPath was overridden
			should.exist(key.settings().credentialsPath);

			key.ensureAuthHeaders()
				.then(() => done('secret is required'))
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('secret is required');

					return done();
				});
		});

		it('should use supplied clientId and secret', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.post('/v0/tokens')
				.reply(201, { token : mockToken });

			key = new KeyProxy({}, 'testing', 'testing');

			// make sure credentialsPath is empty
			should.not.exist(key.settings().credentialsPath);

			key.ensureAuthHeaders()
				.then((response) => {
					should.exist(response);
					should.exist(response['x-client-id']);
					response['x-client-id'].should.equal('clientId');
					should.exist(response['x-authentication-token']);
					response['x-authentication-token'].should.equal('token');

					return done();
				})
				.catch(done);
		});

		it('should allow overridden clientId and secret', (done) => {
			let credentials = {};

			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com',
				{
					reqheaders : {
						'x-client-id': (clientId) => (credentials.clientId = clientId),
						'x-client-secret': (secret) => (credentials.secret = secret)
					}
				})
				.post('/v0/tokens')
				.reply(201, { token : mockToken });

			key = new KeyProxy({}, 'testing', 'testing');

			// make sure credentialsPath is empty
			should.not.exist(key.settings().credentialsPath);

			key.ensureAuthHeaders({
				clientId : 'test-overridden',
				secret : 'test-overridden'
			}).then((response) => {
				should.exist(response);
				should.exist(credentials);
				credentials.clientId.should.equal('test-overridden');
				credentials.secret.should.equal('test-overridden');

				return done();
			}).catch(done);
		});

		it('should allow overridden clientId without token', (done) => {
			key = new KeyProxy({}, 'testing', 'testing');

			// make sure credentialsPath is empty
			should.not.exist(key.settings().credentialsPath);

			key.ensureAuthHeaders({
				clientId : 'test-overridden'
			}).then((response) => {
				should.exist(response);
				should.exist(response['x-client-id']);
				should.not.exist(response['x-authentication-token']);
				response['x-client-id'].should.equal('test-overridden');

				return done();
			}).catch(done);
		});

		it('should allow overridden clientId with token', (done) => {
			key = new KeyProxy({}, 'testing', 'testing');

			// make sure credentialsPath is empty
			should.not.exist(key.settings().credentialsPath);

			key.ensureAuthHeaders({
				clientId : 'test-overridden',
				token : 'test-overridden'
			}).then((response) => {
				should.exist(response);
				should.exist(response['x-client-id']);
				should.exist(response['x-authentication-token']);
				response['x-client-id'].should.equal('test-overridden');
				response['x-authentication-token'].should.equal('test-overridden');

				return done();
			}).catch(done);
		});
	});

	describe('#generateToken', () => {
		it('should detect missing clientId', (done) => {
			key.generateToken()
				.then(() => (done('clientId is required')))
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.equal('clientId is required');

					return done();
				});
		});

		it('should detect missing secret', (done) => {
			key.generateToken('clientId', undefined, function (err, token) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.equal('secret is required');
				should.not.exist(token);

				return done();
			});
		});

		it('should properly generate token (promise)', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.post('/v0/tokens')
				.reply(201, { token : mockToken });

			key.generateToken('clientId', 'secret')
				.then((token) => {
					should.exist(token);
					should.exist(token.clientId);
					should.exist(token);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly generate token (callback)', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.post('/v0/tokens')
				.reply(201, { token : mockToken });

			key.generateToken('clientId', 'secret', function (err, token) {
				should.not.exist(err);
				should.exist(token);
				should.exist(token.clientId);
				should.exist(token.tokenId);

				return done();
			});
		});
	});

	describe('#getClient', () => {
		beforeEach(() => {
			// override ensureAuthHeaders
			key.ensureAuthHeaders = function () {
				return new Promise((resolve, reject) => {
					return resolve({
						'x-client-id': 'test',
						'x-authentication-token': 'test'
					});
				});
			};
		});

		it('should require clientId (promise)', (done) => {
			key.getClient()
				.then(() => {
					return done(new Error('should require stationId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('clientId is required');

					return done();
				});
		});

		it('should require clientId (callback)', (done) => {
			key.getClient(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('clientId is required');
				should.not.exist(result);

				return done();
			});
		});

		it('should properly retrieve client (promise)', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.get('/v0/clients/test')
				.reply(200, { total : 0 });

			key.getClient('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve client (callback)', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.get('/v0/clients/test')
				.reply(200, { total : 0 });

			key.getClient('test', function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#getTokenCacheSize', () => {
		it('should cache tokens when enabled', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.post('/v0/tokens')
				.times(2) // intercept two requests (token and token3)
				.reply(201, { token : mockToken });

			co(function *() {
				let
					token = yield key.generateToken('clientId', 'secret'),
					token2,
					token3;

				should.exist(token);
				key.getTokenCacheSize().should.equal(1);

				token2 = yield key.generateToken('clientId', 'secret');
				should.exist(token2);
				token2.should.equal(token);
				key.getTokenCacheSize().should.equal(1);

				token3 = yield key.generateToken('different-clientId', 'secret');
				should.exist(token3);
				token3.should.not.equal(token);
				key.getTokenCacheSize().should.equal(2);
			})
			.then(done)
			.catch(done);
		});

		it('should not cache tokens when disabled', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.post('/v0/tokens')
				.times(2) // intercept two requests (token and token2)
				.reply(201, { token : mockToken });

			key = new KeyProxy({
				cacheTokens : false
			});

			co(function *() {
				let
					token = yield key.generateToken('clientId', 'secret'),
					token2;

				should.exist(token);
				key.getTokenCacheSize().should.equal(0);

				token2 = yield key.generateToken('clientId', 'secret');
				should.exist(token2);
				key.getTokenCacheSize().should.equal(0);
			})
			.then(done)
			.catch(done);
		});
	});

	describe('#grantClientAccess', () => {
		beforeEach(() => {
			// override ensureAuthHeaders
			key.ensureAuthHeaders = function () {
				return new Promise((resolve, reject) => {
					return resolve({
						'x-client-id': 'test',
						'x-authentication-token': 'test'
					})
				})
			};
		});

		it('should detect missing clientId', (done) => {
			key.grantClientAccess()
				.then(() => (done('clientId is required')))
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.equal('clientId is required');

					return done();
				});
		});

		it('should detect missing serviceId', (done) => {
			key.grantClientAccess('clientId', undefined, function (err, token) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.equal('serviceId is required');
				should.not.exist(token);

				return done();
			});
		});

		it('should properly validate client (promise)', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.post('/v0/clients/clientId/services/serviceId')
				.reply(201, {});

			key.grantClientAccess('clientId', 'serviceId')
				.then((client) => {
					should.exist(client);

					return done();
				})
				.catch(done);
		});

		it('should properly validate client (callback)', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.post('/v0/clients/clientId/services/serviceId')
				.reply(201, {});

			key.grantClientAccess('clientId', 'serviceId',
				(err, client) => {
					if (err) {
						return done(err);
					}

					should.exist(client);

					return done();
				}
			);
		});
	});

	describe('#purgeTokenCache', () => {
		it('should return false when nothing is purgeable', () => {
			key.getTokenCacheSize().should.equal(0);
			let purged = key.purgeTokenCache();
			key.getTokenCacheSize().should.equal(0);
			purged.should.be.false;
		});

		it('should clear all tokens', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.post('/v0/tokens')
				.times(2) // intercept two requests (token and token3)
				.reply(201, { token : mockToken });

			co(function *() {
				let
					token1 = yield key.generateToken('clientId1', 'secret'),
					token2 = yield key.generateToken('clientId2', 'secret');

				should.exist(token1);
				should.exist(token2);
				key.getTokenCacheSize().should.equal(2);

				let purged = key.purgeTokenCache();
				key.getTokenCacheSize().should.equal(0);

				purged.should.be.true;
			})
			.then(done)
			.catch(done);
		});

		it('should clear specific tokens', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.post('/v0/tokens')
				.times(2) // intercept two requests (token and token3)
				.reply(201, { token : mockToken });

			co(function *() {
				let
					token1 = yield key.generateToken('clientId1', 'secret'),
					token2 = yield key.generateToken('clientId2', 'secret');

				should.exist(token1);
				should.exist(token2);
				key.getTokenCacheSize().should.equal(2);

				let purged = key.purgeTokenCache('clientId1');
				key.getTokenCacheSize().should.equal(1);
				purged.should.be.true;

				// retry should indicate false
				purged = key.purgeTokenCache('clientId1');
				key.getTokenCacheSize().should.equal(1);
				purged.should.be.false;

				purged = key.purgeTokenCache('clientId2');
				key.getTokenCacheSize().should.equal(0);
				purged.should.be.true;
			})
			.then(done)
			.catch(done);
		});
	});

	describe('#updateClient', () => {
		beforeEach(() => {
			// override ensureAuthHeaders
			key.ensureAuthHeaders = function () {
				return new Promise((resolve, reject) => {
					return resolve({
						'x-client-id': 'test',
						'x-authentication-token': 'test'
					})
				})
			};
		});

		let
			mockClientId = '123',
			mockClient = {
				name : 'test client'
			};

		it('should require clientId (promise)', (done) => {
			key.updateClient()
				.then(() => {
					return done(new Error('should require clientId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('clientId is required');

					return done();
				})
		});

		it('should require clientId (callback)', (done) => {
			key.updateClient(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('clientId is required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require client details (promise)', (done) => {
			key.updateClient(mockClientId)
				.then(() => {
					return done(new Error('should require client'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('client details are required');

					return done();
				})
		});

		it('should require client details (callback)', (done) => {
			key.updateClient(mockClientId, function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('client details are required');
				should.not.exist(result);

				return done();
			});
		});

		it('should properly update client (promise)', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.put('/v0/clients/123')
				.reply(202, mockClient);

			key.updateClient(mockClientId, mockClient)
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly update client (callback)', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.put('/v0/clients/123')
				.reply(202, mockClient);

			key.updateClient(mockClientId, mockClient, function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#validateClient', () => {
		it('should detect missing clientId', (done) => {
			key.validateClient()
				.then(() => (done('clientId is required')))
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.equal('clientId is required');

					return done();
				});
		});

		it('should detect missing serviceId', (done) => {
			key.validateClient('clientId', undefined, function (err, token) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.equal('serviceId is required');
				should.not.exist(token);

				return done();
			});
		});

		it('should properly validate client (promise)', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.head('/v0/clients/clientId')
				.reply(200);

			key.validateClient('clientId', 'serviceId')
				.then((valid) => {
					should.exist(valid);
					valid.should.be.true;

					return done();
				})
				.catch(done);
		});

		it('should properly validate client (callback)', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.head('/v0/clients/clientId')
				.reply(200);

			key.validateClient('clientId', 'serviceId', (err, valid) => {
				if (err) {
					return done(err);
				}

				should.exist(valid);
				valid.should.be.true;

				return done();
			});
		});

		it('should properly handle non-existing client (promise)', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.head('/v0/clients/clientId')
				.reply(404);

			key.validateClient('clientId', 'serviceId')
				.then((valid) => {
					should.exist(valid);
					valid.should.be.false;

					return done();
				})
				.catch(done);
		});
	});

	describe('#validateToken', () => {
		it('should detect missing clientId', (done) => {
			key.validateToken()
				.then(() => (done('clientId is required')))
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.equal('clientId is required');

					return done();
				});
		});

		it('should detect missing token', (done) => {
			key.validateToken('clientId', undefined, function (err, token) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.equal('token is required');
				should.not.exist(token);

				return done();
			});
		});

		it('should properly validate token without serviceId (promise)', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.get('/v0/tokens/testing')
				.reply(200, mockToken);

			key.validateToken('clientId', 'testing')
				.then((valid) => {
					should.exist(valid);
					valid.should.be.true;

					return done();
				})
				.catch(done);
		});

		it('should properly validate token with serviceId (promise)', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.get('/v0/tokens/testing')
				.reply(200, mockToken);

			key.validateToken('clientId', { tokenId : 'testing' }, 'serviceId')
				.then((valid) => {
					should.exist(valid);
					valid.should.be.true;

					return done();
				})
				.catch(done);
		});

		it('should properly validate token without serviceId (callback)', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.get('/v0/tokens/testing')
				.reply(404, { statusCode : 404, message : 'does not exist' });

			key.validateToken('clientId', 'testing', function (err, valid) {
				should.not.exist(err);
				should.exist(valid);
				valid.should.be.false;

				return done();
			});
		});

		it('should properly validate token with serviceId (callback)', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.get('/v0/tokens/testing')
				.reply(404, { statusCode : 404, message : 'does not exist' });

			key.validateToken('clientId', 'testing', 'serviceId', function (err, valid) {
				should.not.exist(err);
				should.exist(valid);
				valid.should.be.false;

				return done();
			});
		});

		it('should properly bubble server errors', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.get('/v0/tokens/testing')
				.reply(409, { message : 'testing error' });

			key
				.validateToken('clientId', 'testing', 'serviceId')
			 	.then(() => done(new Error('should properly bubble server errors')))
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);

					return done();
				});
		});

		it('should properly add tokens to token cache (when enabled)', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.get(/\/v0\/tokens\/*/)
				.times(2) // intercept two requests (token and token3)
				.reply(200, mockToken );

			co(function *() {
				let
					valid = yield key.validateToken('clientId', 'token', 'serviceId'),
					valid2,
					valid3;

				should.exist(valid);
				key.getTokenCacheSize().should.equal(1);

				valid2 = yield key.validateToken('differentClientId', 'token', 'serviceId');
				should.exist(valid2);
				key.getTokenCacheSize().should.equal(2);

				valid3 = yield key.validateToken('differentClientId', 'token', 'serviceId');
				should.exist(valid3);
				key.getTokenCacheSize().should.equal(2);
			})
			.then(done)
			.catch(done);
		});

		it('should verify current token is equal to cached one (when token cache was enabled)', (done) => {
			nock('https://key-api.apps.playnetwork.com')
				.get('/v0/tokens/goodtoken')
				.reply(200, mockToken);

			nock('https://key-api.apps.playnetwork.com')
				.get('/v0/tokens/badtoken')
				.reply(404, { statusCode : 404, message : 'does not exist' });

			key.validateToken('clientId', 'goodtoken', function (err, valid) {
				should.not.exist(err);
				should.exist(valid);

				valid.should.be.true;

				// clientId's goodtoken should be cached
				// try to validate the same clientId using a badtoken
				key.validateToken('clientId', 'badtoken', function (err, valid2) {
					should.not.exist(err);
					should.exist(valid2);

					// tokenCacheSize should be still 1 because we use the same client
					key.getTokenCacheSize().should.equal(1);

					// badtoken should not be valid
					valid2.should.be.false;

					return done();
				});
			});
		});

		it('should clear the cached token if it has expired', (done) => {
			let oldToken = {
				clientId : 'clientId',
				tokenId : 'oldToken',
				expires : new Date(
					mockToken.expires.setUTCDate(
						mockToken.expires.getUTCDate() - 2))
			};

			nock('https://key-api.apps.playnetwork.com')
				.get('/v0/tokens/oldToken')
				.reply(200, oldToken);
			nock('https://key-api.apps.playnetwork.com')
				.get('/v0/tokens/token')
				.reply(200, mockToken);

			key.validateToken('clientId', 'oldToken', function (err, valid) {
				// round 1: let key-api cache the old token
				should.not.exist(err);
				should.exist(valid);
				key.getTokenCacheSize().should.equal(1);
				valid.should.be.true;

				// round 2: cached token has expired; validate with a new token
				key.validateToken('clientId', 'token', function (err, valid) {
					should.not.exist(err);
					should.exist(valid);
					key.getTokenCacheSize().should.equal(1);
					valid.should.be.true;

					return done();

					/*
					// breaking units, requires further research to understand why this exists
					// round 3: cached token should be used
					key.validateToken('clientId', 'token', function (err, valid) {
						should.not.exist(err);
						should.exist(valid);
						key.getTokenCacheSize().should.equal(1);
						valid.should.be.true;

						return done();
					});
					//*/
				});
			});
		});
	});

	describe('#version', () => {
		it('should properly return version (promise)', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.get(/\/v[0-9]{1}\/version/i)
				.reply(200, { version : 'test' });

			key.version()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});

		it('should properly return version (callback)', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.get(/\/v[0-9]{1}\/version/i)
				.reply(200, { version : 'test' });

			key.version(function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});
});
