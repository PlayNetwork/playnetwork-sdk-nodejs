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
});
