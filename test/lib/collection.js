/*eslint no-magic-numbers: 0*/
/*eslint no-unused-expressions: 0*/
var
	chai = require('chai'),
	co = require('co'),
	nock = require('nock'),

	CollectionProxy = require('../../lib/collection'),

	should = chai.should();

describe('collection', () => {
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
		collection,
		requestInfo,
		responseInfo;

	afterEach(() => {
		requestInfo = undefined;
		responseInfo = undefined;
	});

	beforeEach(() => {
		collection = new CollectionProxy(null, ensureAuthHeaders);

		// capture request and response info
		collection.on('request', (info) => (requestInfo = info));
		collection.on('response', (info) => (responseInfo = info));
	});

	describe('ctor', () => {
		it('should properly construct', () => {
			let
				proxy1 = new CollectionProxy({
					host : 'one'
				}),
				proxy2 = new CollectionProxy({
					host : 'two'
				});

			proxy1.settings().host.should.not.equal(proxy2.settings().host);
		});

		it('should be constructable without options...', () => {
			let proxy = new CollectionProxy();
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
				proxy = new CollectionProxy(options);

			should.exist(proxy.allCollections);
			should.exist(proxy.allCollectionTracks);
			should.exist(proxy.getCollection);
			should.exist(proxy.settings);
			should.exist(proxy.upsertCollections);
			proxy.settings().should.not.be.empty;
			proxy.settings().agent.should.equal(options.agent);
			proxy.settings().host.should.equal(options.host);
			proxy.settings().port.should.equal(options.port);
			proxy.settings().rejectUnauthorized.should.equal(options.rejectUnauthorized);
			proxy.settings().secure.should.equal(options.secure);
		});
	});

	describe('#allCollections', () => {
		it('should properly retrieve all collections (promise)', (done) => {
			// intercept outbound request
			nock('https://master-collectionapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.get('/v3/collections')
				.reply(200, { total : 0 });

			collection.allCollections()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve all collections (callback)', (done) => {
			// intercept outbound request
			nock('https://master-collectionapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.get('/v3/collections')
				.reply(200, { total : 0 });

			collection.allCollections((err, result) => {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly support query filters', (done) => {
			// intercept outbound request
			nock('https://master-collectionapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.get(/\/v3\/collections[.]*/)
				.reply(200, { total : 0 });

			collection.allCollections({
				filters : {
					mandatory : {
						exact : {
							'title' : 'test'
						}
					}
				}
			}).then((result) => {
				should.exist(result);
				should.exist(requestInfo);
				should.exist(requestInfo.query);
				should.exist(requestInfo.query['filters[mandatory][exact][title]']);
				requestInfo.query['filters[mandatory][exact][title]'].should.equal('test');

				return done();
			}).catch((err) => (done(err)));
		});
	});

	describe('#allCollectionTracks', () => {
		it('should require collectionId', (done) => {
			collection.allCollectionTracks((err, result) => {
				should.not.exist(result);
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('collectionId is required');

				return done();
			});
		});

		it('should properly retrieve all collection tracks (promise)', (done) => {
			// intercept outbound request
			nock('https://master-collectionapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.get('/v3/collections/test/tracks')
				.reply(200, { total : 0 });

			collection.allCollectionTracks('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve all collection tracks (callback)', (done) => {
			// intercept outbound request
			nock('https://master-collectionapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.get('/v3/collections/test/tracks')
				.reply(200, { total : 0 });

			collection.allCollectionTracks('test', (err, result) => {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#call', () => {
		beforeEach(() => {
			// override ensureAuthHeaders
			collection.ensureAuthHeaders = () => {
				return new Promise((resolve, reject) => {
					return resolve({
						'x-client-id': 'test',
						'x-authentication-token': 'test'
					})
				})
			};
		});

		it('should require options (callback)', (done) => {
			collection.call((err, result) => {
				should.exist(err);
				should.exist(err.message);
				err.message.should.equal('options are required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require options (promise)', (done) => {
			collection
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
			collection.call({ method : 'get' }, (err, result) => {
				should.exist(err);
				should.exist(err.message);
				err.message.should.equal('options.pathname is required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require options.pathname (promise)', (done) => {
			collection
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
			nock('https://master-collectionapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.get('/v0/test')
				.reply(200, { test : true });

			collection.call({ pathname : '/v0/test' }, (err, result) => {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should default invalid options.method (promise)', (done) => {
			// intercept outbound request
			nock('https://master-collectionapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.get('/v0/test')
				.reply(200, { test : true });

			collection
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
			nock('https://master-collectionapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.put('/v0/test')
				.reply(202, { test : true });

			collection
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
			nock('https://master-collectionapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.post('/v0/test', data)
				.reply(201, data);

			collection
				.call({ pathname : '/v0/test', method : 'POST', data : data })
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});
	});

	describe('#getCollection', () => {
		it('should require collectionId (promise)', (done) => {
			collection.getCollection()
				.then(() => {
					return done(new Error('should require collectionId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('collectionId is required');

					return done();
				})
		});

		it('should require collectionId (callback)', (done) => {
			collection.getCollection((err, result) => {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('collectionId is required');
				should.not.exist(result);

				return done();
			});
		});

		it('should properly retrieve collection (promise)', (done) => {
			// intercept outbound request
			nock('https://master-collectionapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.get('/v3/collections/test')
				.reply(200, { total : 0 });

			collection.getCollection('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve collection (callback)', (done) => {
			// intercept outbound request
			nock('https://master-collectionapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.get('/v3/collections/test')
				.reply(200, { total : 0 });

			collection.getCollection('test', (err, result) => {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#upsertCollections', () => {
		let mockCollection = {
			collectionId : 'test',
			title : 'testTitle'
		};

		it('should require collection details (promise)', (done) => {
			collection.upsertCollections()
				.then(() => {
					return done(new Error('should require collections'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('collections are required');

					return done();
				})
		});

		it('should require collection details (callback)', (done) => {
			collection.upsertCollections({}, (err, result) => {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('collections are required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require collectionId', (done) => {
			collection.upsertCollections({ other : true }, (err, result) => {
				should.not.exist(result);
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('collectionId is required');

				return done();
			});
		});

		it('should validate all collections in an array', (done) => {
			collection.upsertCollections([mockCollection, { other : true }], (err, result) => {
				should.not.exist(result);
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('collection 1 of 2');
				err.message.should.contain('collectionId is required');

				return done();
			});
		});

		it('should properly upsert collection (promise)', (done) => {
			// intercept outbound request
			nock('https://master-collectionapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.put('/v3/collections')
				.reply(200, mockCollection);

			collection.upsertCollections({
					title : 'testing',
					collectionId : 'testId'
				})
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});

		it('should properly upsert collection (callback)', (done) => {
			// intercept outbound request
			nock('https://master-collectionapi.scaffold-workers-ext-main-us.m.cld.octavelive.com')
				.put('/v3/collections')
				.reply(200, mockCollection);

			collection.upsertCollections(mockCollection, (err, result) => {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});
});