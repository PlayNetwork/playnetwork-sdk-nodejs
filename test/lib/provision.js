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
		provision.on('request', (info) => (requestInfo = info));
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

			should.exist(proxy.allOrders);
			should.exist(proxy.getOrder);
			should.exist(proxy.updateOrder);
			should.exist(proxy.settings);
			proxy.settings().should.not.be.empty;
			proxy.settings().agent.should.equal(options.agent);
			proxy.settings().host.should.equal(options.host);
			proxy.settings().port.should.equal(options.port);
			proxy.settings().rejectUnauthorized.should.equal(options.rejectUnauthorized);
			proxy.settings().secure.should.equal(options.secure);
		});
	});

	describe('#allOrders', () => {
		it('should properly retrieve all orders (promise)', (done) => {
			// intercept outbound request
			nock('https://provision-api.apps.playnetwork.com')
				.get('/v2/orders')
				.reply(200, { total : 0 });

			provision.allOrders()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve all orders (callback)', (done) => {
			// intercept outbound request
			nock('https://provision-api.apps.playnetwork.com')
				.get('/v2/orders')
				.reply(200, { total : 0 });

			provision.allOrders(function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#call', () => {
		beforeEach(() => {
			// override ensureAuthHeaders
			provision.ensureAuthHeaders = function () {
				return new Promise((resolve, reject) => {
					return resolve({
						'x-client-id': 'test',
						'x-authentication-token': 'test'
					})
				})
			};
		});

		it('should require options (callback)', (done) => {
			provision.call(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.equal('options are required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require options (promise)', (done) => {
			provision
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
			provision.call({ method : 'get' }, function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.equal('options.pathname is required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require options.pathname (promise)', (done) => {
			provision
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
			nock('https://provision-api.apps.playnetwork.com')
				.get('/v0/test')
				.reply(200, { test : true });

			provision.call({ pathname : '/v0/test' }, function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should default invalid options.method (promise)', (done) => {
			// intercept outbound request
			nock('https://provision-api.apps.playnetwork.com')
				.get('/v0/test')
				.reply(200, { test : true });

			provision
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
			nock('https://provision-api.apps.playnetwork.com')
				.put('/v0/test')
				.reply(202, { test : true });

			provision
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
			nock('https://provision-api.apps.playnetwork.com')
				.post('/v0/test', data)
				.reply(201, data);

			provision
				.call({ pathname : '/v0/test', method : 'POST', data : data })
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});
	});

	describe('#createOrder', () => {
		let mockOrder = {
			packingSlipId: 'abc123',
			identityMap: {
				dsiToken: '123456'
			},
			stations: ['test']
		};

		it('should require order details (promise)', (done) => {
			provision.createOrder()
				.then(() => {
					return done(new Error('should require order'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('order is required');

					return done();
				});
		});

		it('should require order details (callback)', (done) => {
			provision.createOrder(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('order is required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require packingSlipId', (done) => {
			provision.createOrder({ other: true })
				.then(() => {
					return done(new Error('should require packingSlipId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('packingSlipId is required');

					return done();
				});
		});

		it('should require identityMap', (done) => {
			provision.createOrder({ packingSlipId: 'abc123' })
				.then(() => {
					return done(new Error('should require identityMap'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('identityMap is required');

					return done();
				});
		});

		it('should require dsiToken', (done) => {
			provision.createOrder({ packingSlipId: 'abc123', identityMap: { other: true } })
				.then(() => {
					return done(new Error('should require dsiToken'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('dsiToken is required');

					return done();
				});
		});

		it('should require stations', (done) => {
			provision.createOrder({ packingSlipId: 'abc123', identityMap: { dsiToken: '123456' } })
				.then(() => {
					return done(new Error('should require stations'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('either shipToAddress or stations is required');

					return done();
				});
		});

		it('should properly create order (promise)', (done) => {
			// intercept outbound request
			nock('https://provision-api.apps.playnetwork.com')
				.post('/v2/orders')
				.reply(200, mockOrder);

			provision.createOrder(mockOrder)
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly create order (callback)', (done) => {
			// intercept outbound request
			nock('https://provision-api.apps.playnetwork.com')
				.post('/v2/orders')
				.reply(200, mockOrder);

			provision.createOrder(mockOrder, function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#getClientCredentialsStream', () => {
		it('should properly retrieve credentials (promise)', (done) => {
			// intercept outbound request
			nock('https://provision-api.apps.playnetwork.com')
				.get('/v2/devices/5/activation')
				.reply(200, {} );

			provision.getClientCredentialsStream('5')
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
				.get('/v2/devices/5/activation')
				.reply(200, {} );

			provision.getClientCredentialsStream()
				.then((result) => {
					return done(new Error('should have rejected'))
				})
				.catch((err) => {
					err.message.should.equals('deviceId is required');
					return done();
				})
		});
	});

	describe('#getApplicationsStream', () => {
		it('should return a list of apps', (done) => {
			// intercept outbound request
			nock('https://provision-api.apps.playnetwork.com')
				.get('/v2/devices')
				.reply(200, ['app1', 'app2', 'app3'] );

			provision.getApplicationsStream()
				.then((result) => {
					should.exist(result);

					return done();
				})
				.catch((err) => (done(err)));
		});
	});

	describe('#getOrder', () => {
		it('should require orderId (promise)', (done) => {
			provision.getOrder()
				.then(() => {
					return done(new Error('should require orderId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('orderId is required');

					return done();
				})
		});

		it('should require orderId (callback)', (done) => {
			provision.getOrder(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('orderId is required');
				should.not.exist(result);

				return done();
			});
		});

		it('should properly retrieve order (promise)', (done) => {
			// intercept outbound request
			nock('https://provision-api.apps.playnetwork.com')
				.get('/v2/orders/test')
				.reply(200, { total : 0 });

			provision.getOrder('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve order (callback)', (done) => {
			// intercept outbound request
			nock('https://provision-api.apps.playnetwork.com')
				.get('/v2/orders/test')
				.reply(200, { total : 0 });

			provision.getOrder('test', function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#updateOrder', () => {
		let mockOrder = {
			orderId : 'test'
		};

		it('should require order details (promise)', (done) => {
			provision.updateOrder()
				.then(() => {
					return done(new Error('should require order'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('order is required');

					return done();
				})
		});

		it('should require order details (callback)', (done) => {
			provision.updateOrder(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('order is required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require orderId', (done) => {
			provision.updateOrder({ other : true }, function (err, result) {
				should.not.exist(result);
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('orderId is required');

				return done();
			});
		});

		it('should properly update order (promise)', (done) => {
			// intercept outbound request
			nock('https://provision-api.apps.playnetwork.com')
				.put('/v2/orders/test')
				.reply(200, mockOrder);

			provision.updateOrder(mockOrder)
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly update order (callback)', (done) => {
			// intercept outbound request
			nock('https://provision-api.apps.playnetwork.com')
				.put('/v2/orders/test')
				.reply(200, mockOrder);

			provision.updateOrder(mockOrder, function (err, result) {
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

		it('should properly return version (callback)', (done) => {
			// intercept outbound request
			nock('https://provision-api.apps.playnetwork.com')
				.get(/\/v[0-9]{1}\/version/i)
				.reply(200, { version : 'test' });

			provision.version(function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});
});
