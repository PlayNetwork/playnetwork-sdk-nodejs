/*eslint no-magic-numbers: 0*/
/*eslint no-unused-expressions: 0*/
var
	chai = require('chai'),
	co = require('co'),
	nock = require('nock'),

	LocationProxy = require('../../lib/location'),

	should = chai.should();


describe('location', () => {
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
		location,
		requestInfo,
		responseInfo;

	afterEach(() => {
		requestInfo = undefined;
		responseInfo = undefined;
	});

	beforeEach(() => {
		location = new LocationProxy(null, ensureAuthHeaders);

		// capture request and response info
		location.on('request', (info) => (requestInfo = info));
		location.on('response', (info) => (responseInfo = info));
	});

	describe('ctor', () => {
		it('should properly construct', () => {
			let
				proxy1 = new LocationProxy({
					host : 'one'
				}),
				proxy2 = new LocationProxy({
					host : 'two'
				});

			proxy1.settings().host.should.not.equal(proxy2.settings().host);
		});

		it('should be constructable without options...', () => {
			let proxy = new LocationProxy();
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
				proxy = new LocationProxy(options);

			should.exist(proxy.allAccountLocations);
			should.exist(proxy.allLocations);
			should.exist(proxy.allPhysicalLocations);
			should.exist(proxy.call);
			should.exist(proxy.deletePhysicalLocation);
			should.exist(proxy.getLocation);
			should.exist(proxy.getPhysicalLocation);
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

	describe('#allAccountLocations', () => {
		it('should properly retrieve all account locations (promise)', (done) => {
			// intercept outbound request
			nock('https://location-api.apps.playnetwork.com')
				.get('/v0/locations/accounts')
				.reply(200, { total : 0 });

			location.allAccountLocations()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve all locations (callback)', (done) => {
			// intercept outbound request
			nock('https://location-api.apps.playnetwork.com')
				.get('/v0/locations/accounts')
				.reply(200, { total : 0 });

			location.allAccountLocations(function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly support query filters', (done) => {
			// intercept outbound request
			nock('https://location-api.apps.playnetwork.com')
				.get(/\/v0\/locations\/accounts[.]*/)
				.reply(200, { total : 0 });

			location.allAccountLocations(
				{
					filters : {
						mandatory : {
							exists : 'locationId'
						}
					}
				}).then((result) => {
					should.exist(result);
					should.exist(requestInfo);
					should.exist(requestInfo.query);
					should.exist(requestInfo.query['filters[mandatory][exists]']);
					requestInfo.query['filters[mandatory][exists]'].should.equal('locationId');

					return done();
				}).catch((err) => (done(err)));
		});
	});

	describe('#allLocations', () => {
		it('should properly retrieve all locations (promise)', (done) => {
			// intercept outbound request
			nock('https://location-api.apps.playnetwork.com')
				.get('/v0/locations')
				.reply(200, { total : 0 });

			location.allLocations()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve all locations (callback)', (done) => {
			// intercept outbound request
			nock('https://location-api.apps.playnetwork.com')
				.get('/v0/locations')
				.reply(200, { total : 0 });

			location.allLocations(function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly support query filters', (done) => {
			// intercept outbound request
			nock('https://location-api.apps.playnetwork.com')
				.get(/\/v0\/locations[.]*/)
				.reply(200, { total : 0 });

			location.allLocations(
				{
					filters : {
						mandatory : {
							exists : 'physicalLocationId'
						}
					}
				}).then((result) => {
					should.exist(result);
					should.exist(requestInfo);
					should.exist(requestInfo.query);
					should.exist(requestInfo.query['filters[mandatory][exists]']);
					requestInfo.query['filters[mandatory][exists]'].should.equal('physicalLocationId');

					return done();
				}).catch((err) => (done(err)));
		});
	});

	describe('#allPhysicalLocations', () => {
		it('should properly retrieve all account locations (promise)', (done) => {
			// intercept outbound request
			nock('https://location-api.apps.playnetwork.com')
				.get('/v0/locations/physical')
				.reply(200, { total : 0 });

			location.allPhysicalLocations()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve all locations (callback)', (done) => {
			// intercept outbound request
			nock('https://location-api.apps.playnetwork.com')
				.get('/v0/locations/physical')
				.reply(200, { total : 0 });

			location.allPhysicalLocations(function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly support query filters', (done) => {
			// intercept outbound request
			nock('https://location-api.apps.playnetwork.com')
				.get(/\/v0\/locations\/physical[.]*/)
				.reply(200, { total : 0 });

			location.allPhysicalLocations(
				{
					filters : {
						mandatory : {
							exists : 'locationId'
						}
					}
				}).then((result) => {
					should.exist(result);
					should.exist(requestInfo);
					should.exist(requestInfo.query);
					should.exist(requestInfo.query['filters[mandatory][exists]']);
					requestInfo.query['filters[mandatory][exists]'].should.equal('locationId');

					return done();
				}).catch((err) => (done(err)));
		});
	});

	describe('#call', () => {
		beforeEach(() => {
			// override ensureAuthHeaders
			location.ensureAuthHeaders = function () {
				return new Promise((resolve, reject) => {
					return resolve({
						'x-client-id': 'test',
						'x-authentication-token': 'test'
					})
				})
			};
		});

		it('should require options (callback)', (done) => {
			location.call(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.equal('options are required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require options (promise)', (done) => {
			location
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
			location.call({ method : 'get' }, function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.equal('options.pathname is required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require options.pathname (promise)', (done) => {
			location
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
			nock('https://location-api.apps.playnetwork.com')
				.get('/v0/test')
				.reply(200, { test : true });

			location.call({ pathname : '/v0/test' }, function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should default invalid options.method (promise)', (done) => {
			// intercept outbound request
			nock('https://location-api.apps.playnetwork.com')
				.get('/v0/test')
				.reply(200, { test : true });

			location
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
			nock('https://location-api.apps.playnetwork.com')
				.put('/v0/test')
				.reply(202, { test : true });

			location
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
			nock('https://location-api.apps.playnetwork.com')
				.post('/v0/test', data)
				.reply(201, data);

			location
				.call({ pathname : '/v0/test', method : 'POST', data : data })
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});
	});

	describe('#deletePhysicalLocation', () => {
		it('should require physicalLocationId (promise)', (done) => {
			location.deletePhysicalLocation()
				.then(() => {
					return done(new Error('should require physicalLocationId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('physicalLocationId is required');

					return done();
				})
		});

		it('should require physicalLocationId (callback)', (done) => {
			location.deletePhysicalLocation(function (err, result) {
				should.exist(err);
				should.not.exist(result);
				should.exist(err.message);
				err.message.should.equal('physicalLocationId is required');

				return done();
			});
		});

		it('should properly delete physicalLocation (promise)', (done) => {
			// intercept outbound request
			nock('https://location-api.apps.playnetwork.com')
				.delete('/v0/locations/physical/test')
				.reply(204);

			location.deletePhysicalLocation('test')
				.then(() => {
					should.exist(requestInfo);
					
					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly delete physicalLocation (callback)', (done) => {
			// intercept outbound request
			nock('https://location-api.apps.playnetwork.com')
				.delete('/v0/locations/physical/test')
				.reply(204);

			location.deletePhysicalLocation('test', function (err) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#getLocation', () => {
		it('should require locationId', (done) => {
			location.getLocation(function (err, result) {
				should.exist(err);
				should.not.exist(result);
				should.exist(err.message);
				err.message.should.equal('locationId is required');

				return done();
			});
		});

		it('should properly get a location (promise)', (done) => {
			// intercept outbound request
			nock('https://location-api.apps.playnetwork.com')
				.get('/v0/locations/test')
				.reply(200, { locationId : 'test' });

			location.getLocation('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly get a location (callback)', (done) => {
			// intercept outbound request
			nock('https://location-api.apps.playnetwork.com')
				.get('/v0/locations/test')
				.reply(200, { locationId : 'test' });

			location.getLocation('test', function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly support options', (done) => {
			// intercept outbound request
			nock('https://location-api.apps.playnetwork.com')
				.get('/v0/locations/test?testing=yes')
				.reply(200, { locationId : 'test' });

			location.getLocation('test', { testing : 'yes' }, function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#getLocations', () => {
		it('should require locationIdList', (done) => {
			location.getLocations(function (err, result) {
				should.exist(err);
				should.not.exist(result);
				should.exist(err.message);
				err.message.should.equal('locationIdList is required');

				return done();
			});
		});

		it('should properly get locations (promise)', (done) => {
			// intercept outbound request
			nock('https://location-api.apps.playnetwork.com')
				.post('/v0/locations/locationIds')
				.reply(200, { test : true });

			location.getLocations(['test'])
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly get locations (callback)', (done) => {
			// intercept outbound request
			nock('https://location-api.apps.playnetwork.com')
				.post('/v0/locations/locationIds')
				.reply(200, { test : true });

			location.getLocations(['test'], function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#getPhysicalLocation', () => {
		it('should require physicalLocationId', (done) => {
			location.getPhysicalLocation(function (err, result) {
				should.exist(err);
				should.not.exist(result);
				should.exist(err.message);
				err.message.should.equal('physicalLocationId is required');

				return done();
			});
		});

		it('should properly get a location (promise)', (done) => {
			// intercept outbound request
			nock('https://location-api.apps.playnetwork.com')
				.get('/v0/locations/physical/test')
				.reply(200, { physicalLocationId : 'test' });

			location.getPhysicalLocation('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly get a physical location (callback)', (done) => {
			// intercept outbound request
			nock('https://location-api.apps.playnetwork.com')
				.get('/v0/locations/physical/test')
				.reply(200, { physicalLocationId : 'test' });

			location.getPhysicalLocation('test', function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly support options', (done) => {
			// intercept outbound request
			nock('https://location-api.apps.playnetwork.com')
				.get('/v0/locations/physical/test?testing=yes')
				.reply(200, { physicalLocationId : 'test' });

			location.getPhysicalLocation('test', { testing : 'yes' }, function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#version', () => {
		it('should properly return version (promise)', (done) => {
			// intercept outbound request
			nock('https://location-api.apps.playnetwork.com')
				.get(/\/v[0-9]{1}\/version/i)
				.reply(200, { version : 'test' });

			location.version()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});

		it('should properly return version (callback)', (done) => {
			// intercept outbound request
			nock('https://location-api.apps.playnetwork.com')
				.get(/\/v[0-9]{1}\/version/i)
				.reply(200, { version : 'test' });

			location.version(function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});
});
