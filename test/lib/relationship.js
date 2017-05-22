/*eslint no-magic-numbers: 0*/
/*eslint no-unused-expressions: 0*/
var
	chai = require('chai'),
	co = require('co'),
	nock = require('nock'),

	RelationshipProxy = require('../../lib/relationship'),

	should = chai.should();


describe('relationship', () => {
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
		relationship,
		requestInfo,
		responseInfo;

	afterEach(() => {
		requestInfo = undefined;
		responseInfo = undefined;
	});

	beforeEach(() => {
		relationship = new RelationshipProxy(null, ensureAuthHeaders);

		// capture request and response info
		relationship.on('request', (info) => (requestInfo = info));
		relationship.on('response', (info) => (responseInfo = info));
	});

	describe('ctor', () => {
		it('should properly construct', () => {
			let
				proxy1 = new RelationshipProxy({
					host : 'one'
				}),
				proxy2 = new RelationshipProxy({
					host : 'two'
				});

			proxy1.settings().host.should.not.equal(proxy2.settings().host);
		});

		it('should be constructable without options...', () => {
			let proxy = new RelationshipProxy();
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
				proxy = new RelationshipProxy(options);

			should.exist(proxy.allRelationships);
			should.exist(proxy.createRelationship);
			should.exist(proxy.getRelationship);
			should.exist(proxy.settings);
			should.exist(proxy.upsertRelationships);
			proxy.settings().should.not.be.empty;
			proxy.settings().agent.should.equal(options.agent);
			proxy.settings().host.should.equal(options.host);
			proxy.settings().port.should.equal(options.port);
			proxy.settings().rejectUnauthorized.should.equal(options.rejectUnauthorized);
			proxy.settings().secure.should.equal(options.secure);
		});
	});

	describe('#allRelationships', () => {
		it('should properly retrieve all relationships (promise)', (done) => {
			// intercept outbound request
			nock('https://location-relationships-api.apps.playnetwork.com')
				.get('/v0/relationships')
				.reply(200, { total : 0 });

			relationship.allRelationships()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve all relationships (callback)', (done) => {
			// intercept outbound request
			nock('https://location-relationships-api.apps.playnetwork.com')
				.get('/v0/relationships')
				.reply(200, { total : 0 });

			relationship.allRelationships(function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

	});

	describe('#createRelationship', () => {
		let mockRelationship = {
			'locationId' : 'abcabcabcabc',
			'brandId' : '123123123'
		};

		it('should require relationship details', (done) => {
			relationship.createRelationship()
				.then(() => {
					return done(new Error('should require relationship'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('is required');

					return done();
				})
		});

		it('should properly create relationship (promise)', (done) => {
			// intercept outbound request
			nock('https://location-relationships-api.apps.playnetwork.com')
				.post('/v0/relationships')
				.reply(200, mockRelationship);

			relationship.createRelationship(mockRelationship)
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly create relationship (callback)', (done) => {
			// intercept outbound request
			nock('https://location-relationships-api.apps.playnetwork.com')
				.post('/v0/relationships')
				.reply(200, mockRelationship);

			relationship.createRelationship(mockRelationship, function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#getRelationship', () => {
		it('should require relationship identifer', (done) => {
			relationship.getRelationship()
				.then(() => {
					return done(new Error('should require relationship identifier'));
				})
				.catch((err) => {

					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('relationshipId is required');

					return done();
				});
		});

		it('should properly retrieve relationship (promise)', (done) => {
			// intercept outbound request
			nock('https://location-relationships-api.apps.playnetwork.com')
				.get('/v0/relationships/test')
				.reply(200, { });

			relationship.getRelationship('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve relationship (callback)', (done) => {
			// intercept outbound request
			nock('https://location-relationships-api.apps.playnetwork.com')
				.get('/v0/relationships/test')
				.reply(200, { });

			relationship.getRelationship('test', function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#deleteRelationship', () => {
		it('should require relationship identifer', (done) => {
			relationship.deleteRelationship()
				.then(() => {
					return done(new Error('should require relationship identifier'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('relationshipId is required');

					return done();
				});
		});

		it('should properly delete relationship (promise)', (done) => {
			// intercept outbound request
			nock('https://location-relationships-api.apps.playnetwork.com')
				.delete('/v0/relationships/test')
				.reply(204);

			relationship.deleteRelationship('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly delete relationship (callback)', (done) => {
			// intercept outbound request
			nock('https://location-relationships-api.apps.playnetwork.com')
				.delete('/v0/relationships/test')
				.reply(204);

			relationship.deleteRelationship('test', function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly delete relationship with options (promise)', (done) => {
			// intercept outbound request
			nock('https://location-relationships-api.apps.playnetwork.com')
				.delete('/v0/relationships/test?deviceToken=1')
				.reply(204);

			relationship.deleteRelationship('test', { deviceToken : 1 })
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});
	});

	describe('#upsertRelationships', () => {
		let mockRelationship = {
			'locationId' : 'abcabcabcabc',
			'brandId' : '123123123'
		};

		it('should require relationships details', (done) => {
			relationship.upsertRelationships()
				.then(() => {
					return done(new Error('should require relationships'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('relationships are required');

					return done();
				})
		});

		it('should properly upsert relationships (promise)', (done) => {
			// intercept outbound request
			nock('https://location-relationships-api.apps.playnetwork.com')
				.put('/v0/relationships')
				.reply(200, mockRelationship);

			relationship.upsertRelationships(mockRelationship)
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly upsert relationships (callback)', (done) => {
			// intercept outbound request
			nock('https://location-relationships-api.apps.playnetwork.com')
				.put('/v0/relationships')
				.reply(200, mockRelationship);

			relationship.upsertRelationships(mockRelationship, function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});
	//*/

	describe('#version', () => {
		it('should properly return version (promise)', (done) => {
			// intercept outbound request
			nock('https://location-relationships-api.apps.playnetwork.com')
				.get(/\/v[0-9]{1}\/version/i)
				.reply(200, { version : 'test' });

			relationship.version()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});

		it('should properly return version (callback)', (done) => {
			// intercept outbound request
			nock('https://location-relationships-api.apps.playnetwork.com')
				.get(/\/v[0-9]{1}\/version/i)
				.reply(200, { version : 'test' });

			relationship.version(function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});
});
