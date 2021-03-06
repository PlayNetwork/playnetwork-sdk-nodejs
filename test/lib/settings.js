/*eslint no-magic-numbers: 0*/
/*eslint no-unused-expressions: 0*/
var
	chai = require('chai'),
	co = require('co'),
	nock = require('nock'),

	SettingsProxy = require('../../lib/settings'),

	should = chai.should();


describe('settings', () => {
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
		settings,
		requestInfo,
		responseInfo;

	afterEach(() => {
		requestInfo = undefined;
		responseInfo = undefined;
	});

	beforeEach(() => {
		settings = new SettingsProxy(null, ensureAuthHeaders);

		// capture request and response info
		settings.on('request', (info) => (requestInfo = info));
		settings.on('response', (info) => (responseInfo = info));
	});

	describe('ctor', () => {
		it('should properly construct', () => {
			let
				proxy1 = new SettingsProxy({
					host : 'one'
				}),
				proxy2 = new SettingsProxy({
					host : 'two'
				});

			proxy1.settings().host.should.not.equal(proxy2.settings().host);
		});

		it('should be constructable without options...', () => {
			let proxy = new SettingsProxy();
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
				proxy = new SettingsProxy(options);

			should.exist(proxy.allSettings);
			should.exist(proxy.createSettings);
			should.exist(proxy.getSettings);
			should.exist(proxy.settings);
			should.exist(proxy.upsertSettings);
			proxy.settings().should.not.be.empty;
			proxy.settings().agent.should.equal(options.agent);
			proxy.settings().host.should.equal(options.host);
			proxy.settings().port.should.equal(options.port);
			proxy.settings().rejectUnauthorized.should.equal(options.rejectUnauthorized);
			proxy.settings().secure.should.equal(options.secure);
		});
	});

	describe('#allSettings', () => {
		it('should properly retrieve all settings (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-settings-api.apps.playnetwork.com')
				.get('/v0/settings')
				.reply(200, { total : 0 });

			settings.allSettings()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve all settings (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-settings-api.apps.playnetwork.com')
				.get('/v0/settings')
				.reply(200, { total : 0 });

			settings.allSettings(function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

	});

	describe('#createSettings', () => {
		let mockSetting = {
			legacy : {
				deviceToken : 123123,
				conceptName : 'test concept'
			}
		};

		it('should require setting details', (done) => {
			settings.createSettings()
				.then(() => {
					return done(new Error('should require setting'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('setting is required');

					return done();
				})
		});

		it('should require legacy', (done) => {
			settings.createSettings(
				{ other : true },
				function (err, result) {
					should.not.exist(result);
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('setting legacy is required');

					return done();
				});
		});

		it('should require legacy conceptName', (done) => {
			settings.createSettings(
				{ legacy : { other : true, deviceToken: 123123 } },
				function (err, result) {
					should.not.exist(result);
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('setting legacy conceptName is required');

					return done();
				});
		});

		it('should properly create settings (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-settings-api.apps.playnetwork.com')
				.post('/v0/settings')
				.reply(200, mockSetting);

			settings.createSettings(mockSetting)
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly create settings (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-settings-api.apps.playnetwork.com')
				.post('/v0/settings')
				.reply(200, mockSetting);

			settings.createSettings(mockSetting, function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#getSettings', () => {
		it('should require setting identifer', (done) => {
			settings.getSettings()
				.then(() => {
					return done(new Error('should require settings identifier'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('settings identifier is required');

					return done();
				});
		});

		it('should properly retrieve setting (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-settings-api.apps.playnetwork.com')
				.get('/v0/settings/test')
				.reply(200, { });

			settings.getSettings('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve setting (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-settings-api.apps.playnetwork.com')
				.get('/v0/settings/test')
				.reply(200, { });

			settings.getSettings('test', function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#deleteSettings', () => {
		it('should require setting identifer', (done) => {
			settings.deleteSettings()
				.then(() => {
					return done(new Error('should require settings identifier'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('settings identifier is required');

					return done();
				});
		});

		it('should properly delete settings (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-settings-api.apps.playnetwork.com')
				.delete('/v0/settings/test')
				.reply(204);

			settings.deleteSettings('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly delete settings (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-settings-api.apps.playnetwork.com')
				.delete('/v0/settings/test')
				.reply(204);

			settings.deleteSettings('test', function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly delete settings with options (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-settings-api.apps.playnetwork.com')
				.delete('/v0/settings/test?deviceToken=1')
				.reply(204);

			settings.deleteSettings('test', { deviceToken : 1 })
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});
	});

	describe('#upsertSettings', () => {
		let mockSetting = {
			legacy : {
				deviceToken : 123123,
				conceptName : 'test concept'
			}
		};

		it('should require setting details', (done) => {
			settings.upsertSettings()
				.then(() => {
					return done(new Error('should require playlist'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('setting is required');

					return done();
				})
		});

		it('should properly upsert playlist (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-settings-api.apps.playnetwork.com')
				.put('/v0/settings')
				.reply(200, mockSetting);

			settings.upsertSettings(mockSetting)
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly upsert playlist (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-settings-api.apps.playnetwork.com')
				.put('/v0/settings')
				.reply(200, mockSetting);

			settings.upsertSettings(mockSetting, function (err, result) {
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
			nock('https://curio-settings-api.apps.playnetwork.com')
				.get(/\/v[0-9]{1}\/version/i)
				.reply(200, { version : 'test' });

			settings.version()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});

		it('should properly return version (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-settings-api.apps.playnetwork.com')
				.get(/\/v[0-9]{1}\/version/i)
				.reply(200, { version : 'test' });

			settings.version(function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});
});
