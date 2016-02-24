/*eslint no-magic-numbers: 0*/
var
	chai = require('chai'),
	co = require('co'),
	nock = require('nock'),

	KeyProxy = require('../../lib/key'),
	request = require('../../lib/request'),

	should = chai.should();


describe('key', () => {
	'use strict';

	let
		key,
		mockToken = {
			clientId : 'clientId',
			token : 'token',
			expires : new Date()
		};

	mockToken.expires = new Date(
		mockToken.expires.setUTCDate(
			mockToken.expires.getUTCDate() + 2));

	beforeEach(() => {
		key = new KeyProxy();
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
					should.exist(token.token);

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
				should.exist(token.token);

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
