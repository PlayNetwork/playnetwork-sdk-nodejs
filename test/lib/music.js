/*eslint no-magic-numbers: 0*/
/*eslint no-unused-expressions: 0*/
var
	chai = require('chai'),
	co = require('co'),
	nock = require('nock'),

	MusicProxy = require('../../lib/music'),

	should = chai.should();


describe('music', () => {
	'use strict';

	let
		ensureAuthHeaders = new Promise((resolve, reject) => {
			return resolve({
				'x-client-id': 'test',
				'x-authentication-token': 'test'
			})
		}),
		music,
		requestInfo,
		responseInfo;

	afterEach(() => {
		requestInfo = undefined;
		responseInfo = undefined;
	});

	beforeEach(() => {
		music = new MusicProxy(null, ensureAuthHeaders);

		// capture request and response info
		music.on('request', (info) => (requestInfo = info));
		music.on('response', (info) => (responseInfo = info));
	});

	describe('ctor', () => {
		it('should properly construct', () => {
			let
				proxy1 = new MusicProxy({
					host : 'one'
				}),
				proxy2 = new MusicProxy({
					host : 'two'
				});

			proxy1.settings().host.should.not.equal(proxy2.settings().host);
		});

		it('should be constructable without options...', () => {
			let proxy = new MusicProxy();
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
				proxy = new MusicProxy(options);

			should.exist(proxy.allCollections);
			should.exist(proxy.settings);
			proxy.settings().should.not.be.empty;
			proxy.settings().host.should.equal(options.host);
			proxy.settings().secure.should.equal(options.secure);
		});
	});

	describe('#allCollections', () => {
		it('should properly retrieve all collections (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/collections')
				.reply(200, { total : 0 });

			music.allCollections()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve all collections (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/collections')
				.reply(200, { total : 0 });

			music.allCollections(function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly support query filters', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get(/\/v2\/collections[.]*/)
				.reply(200, { total : 0 });

			music.allCollections({
				filters : {
					mandatory : {
						exact : {
							'legacy.trackToken' : 12345
						}
					}
				}
			}).then((result) => {
				should.exist(result);
				should.exist(requestInfo);
				should.exist(requestInfo.query);
				should.exist(requestInfo.query['filters[mandatory][exact][legacy.trackToken]']);
				requestInfo.query['filters[mandatory][exact][legacy.trackToken]'].should.equal(12345);

				return done();
			}).catch((err) => (done(err)));
		});
	});
});
