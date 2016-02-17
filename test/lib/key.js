var
	chai = require('chai'),
	nock = require('nock'),

	KeyProxy = require('../../lib/key'),

	should = chai.should();


describe('key', () => {
	'use strict';

	let key = new KeyProxy();

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
			key.generateToken('clientId')
				.then(() => (done('clientId is required')))
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.equal('secret is required');

					return done();
				});
		});

		it('should properly generate token (promise)', (done) => {
			// intercept outbound request
			nock('https://key-api.apps.playnetwork.com')
				.post('/v0/tokens')
				.reply(201, { token : { clientId : 'clientId', token : 'token' } });

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
				.reply(201, { token : { clientId : 'clientId', token : 'token' } });

			key.generateToken('clientId', 'secret', function (err, token) {
				should.not.exist(err);
				should.exist(token);
				should.exist(token.clientId);
				should.exist(token.token);

				return done();
			});
		});
	});
});
