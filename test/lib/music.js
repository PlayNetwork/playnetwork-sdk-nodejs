/*eslint no-magic-numbers: 0*/
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
				.reply(200);

			music.allCollections(function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});
	});
});
