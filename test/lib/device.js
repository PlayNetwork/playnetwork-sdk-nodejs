/*eslint no-magic-numbers: 0*/
/*eslint no-unused-expressions: 0*/
var
	chai = require('chai'),
	co = require('co'),
	nock = require('nock'),

	DeviceProxy = require('../../lib/device'),

	should = chai.should();


describe('device', () => {
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
		device,
		requestInfo,
		responseInfo;

	afterEach(() => {
		requestInfo = undefined;
		responseInfo = undefined;
	});

	beforeEach(() => {
		device = new DeviceProxy(null, ensureAuthHeaders);

		// capture request and response info
		device.on('request', (info) => (requestInfo = info));
		device.on('response', (info) => (responseInfo = info));
	});

	describe('ctor', () => {
		it('should properly construct', () => {
			let
				proxy1 = new DeviceProxy({
					host : 'one'
				}),
				proxy2 = new DeviceProxy({
					host : 'two'
				});

			proxy1.settings().host.should.not.equal(proxy2.settings().host);
		});

		it('should be constructable without options...', () => {
			let proxy = new DeviceProxy();
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
				proxy = new DeviceProxy(options);

			should.exist(proxy.allDevices);
			should.exist(proxy.allGroups);
			should.exist(proxy.createEventMessages);
			should.exist(proxy.createStatusReport);
			should.exist(proxy.getDevice);
			should.exist(proxy.getGroup);
			should.exist(proxy.getGroupAnalytics);
			should.exist(proxy.getGroupDevices);
			should.exist(proxy.getGroups);
			should.exist(proxy.getGroupsAnalytics);
			proxy.settings().should.not.be.empty;
			proxy.settings().agent.should.equal(options.agent);
			proxy.settings().host.should.equal(options.host);
			proxy.settings().port.should.equal(options.port);
			proxy.settings().rejectUnauthorized.should.equal(options.rejectUnauthorized);
			proxy.settings().secure.should.equal(options.secure);
		});
	});

	describe('#allDevices', () => {
		it('should properly retrieve all devices (promise)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.get('/v0/devices')
				.reply(200, { total : 0 });

			device.allDevices()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve all devices (callback)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.get('/v0/devices')
				.reply(200, { total : 0 });

			device.allDevices(function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly support query filters', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.get(/\/v0\/devices[.]*/)
				.reply(200, { total : 0 });

			device.allDevices(
				{
					filters : {
						mandatory : {
							exists : 'deviceId'
						}
					}
				}).then((result) => {
					should.exist(result);
					should.exist(requestInfo);
					should.exist(requestInfo.query);
					should.exist(requestInfo.query['filters[mandatory][exists]']);
					requestInfo.query['filters[mandatory][exists]'].should.equal('deviceId');

					return done();
				}).catch((err) => (done(err)));
		});
	});

	describe('#allGroups', () => {
		it('should properly retrieve all groups (promise)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.get('/v0/groups')
				.reply(200, { total : 0 });

			device.allGroups()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve all groups (callback)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.get('/v0/groups')
				.reply(200, { total : 0 });

			device.allGroups(function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly support query filters', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.get(/\/v0\/groups[.]*/)
				.reply(200, { total : 0 });

			device.allGroups(
				{
					filters : {
						mandatory : {
							exists : 'deviceGroupId'
						}
					}
				}).then((result) => {
					should.exist(result);
					should.exist(requestInfo);
					should.exist(requestInfo.query);
					should.exist(requestInfo.query['filters[mandatory][exists]']);
					requestInfo.query['filters[mandatory][exists]'].should.equal('deviceGroupId');

					return done();
				}).catch((err) => (done(err)));
		});
	});

	describe('#createDiagnostics', () => {
		it('should require deviceId', (done) => {
			device.createDiagnostics(null, { test : true })
				.then((result) => {
					return done(new Error('should require deviceId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.equal('deviceId is required');

					return done();
				});
		});

		it('should require diagnostics data', (done) => {
			device.createDiagnostics('test')
				.then((result) => {
					return done(new Error('should require diagnostics data'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.equal('diagnostics are required');

					return done();
				});
		});

		it('should properly apply deviceId from diagnostics when missing (promise)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.post('/v0/devices/test/diagnostics')
				.reply(200, { total : 0 });

			device.createDiagnostics({ deviceId : 'test', test : true })
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly apply deviceId from diagnostics when missing (callback)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.post('/v0/devices/test/diagnostics')
				.reply(200, { total : 0 });

			device.createDiagnostics(
				{ deviceId : 'test', test : true },
				function (err, result) {
					should.not.exist(err);
					should.exist(requestInfo);

					return done();
				});
		});

		it('should properly create diagnostics (promise)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.post('/v0/devices/test/diagnostics')
				.reply(200, { total : 0 });

			device.createDiagnostics('test', { test : true })
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly create diagnostics (callback)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.post('/v0/devices/test/diagnostics')
				.reply(200, { total : 0 });

			device.createDiagnostics(
				'test',
				{ test : true },
				function (err, result) {
					should.not.exist(err);
					should.exist(requestInfo);

					return done();
				});
		});
	});

	describe('#createEventMessages', () => {
		it('should require deviceId', (done) => {
			device.createEventMessages(null, ['test 1'])
				.then((result) => {
					return done(new Error('should require deviceId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.equal('deviceId is required');

					return done();
				});
		});

		it('should require event messages', (done) => {
			device.createEventMessages('test')
				.then((result) => {
					return done(new Error('should require event messages'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.equal('event messages are required');

					return done();
				});
		});

		it('should require message property for each item', (done) => {
			device.createEventMessages(
				'test',
				[{ timestamp : new Date() }],
				function (err, result) {
					should.exist(err);
					should.not.exist(result);
					should.exist(err.message);
					err.message.should.equal('all event messages require message property');

					return done();
				});
		});

		it('should properly create event messages (promise)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.post('/v0/devices/test/events')
				.reply(200, { total : 0 });

			device.createEventMessages('test', ['test 1'])
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly create event messages (callback)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.post('/v0/devices/test/events')
				.reply(200, { total : 0 });

			device.createEventMessages(
				'test',
				['test 1', 'test 2', 'test 3'],
				function (err, result) {
					should.not.exist(err);
					should.exist(requestInfo);

					return done();
				});
		});

		it('should properly default missing properties', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.post('/v0/devices/test/events')
				.reply(200, function (uri, body) {
					return body;
				});

			device.createEventMessages('test', [{ message : 'test 1' }, 'test 2'])
				.then((requestPayload) => {
					should.exist(requestPayload);
					requestPayload.should.have.length(2);
					should.exist(requestPayload[0].deviceId);
					requestPayload[0].deviceId.should.equal('test');
					should.exist(requestPayload[0].level);
					requestPayload[0].level.should.equal('INFO');
					should.exist(requestPayload[0].message);
					requestPayload[0].message.should.equal('test 1');
					should.exist(requestPayload[0].timestamp);
					requestPayload[0].timestamp.should.be.a.date;

					return done();
				})
				.catch((err) => (done(err)));
		});
	});

	describe('#createStatusReport', () => {
		it('should require deviceId', (done) => {
			device.createStatusReport(null, { test : true })
				.then((result) => {
					return done(new Error('should require deviceId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.equal('deviceId is required');

					return done();
				});
		});

		it('should require status report info', (done) => {
			device.createStatusReport('test')
				.then((result) => {
					return done(new Error('should require status report info'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.equal('status details are required');

					return done();
				});
		});

		it('should properly create status report (promise)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.post('/v0/devices/test/events')
				.reply(200, { total : 0 });

			device.createStatusReport('test', { test : true })
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly create status report (callback)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.post('/v0/devices/test/events')
				.reply(200, { total : 0 });

			device.createStatusReport(
				'test',
				{ test : true },
				function (err, result) {
					should.not.exist(err);
					should.exist(requestInfo);

					return done();
				});
		});

		it('should properly default message', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.post('/v0/devices/test/events')
				.reply(200, function (uri, body) {
					return body;
				});

			device.createStatusReport('test', { test : true })
				.then((requestPayload) => {
					should.exist(requestPayload);
					requestPayload.should.have.length(1);
					should.exist(requestPayload[0].deviceId);
					requestPayload[0].deviceId.should.equal('test');
					should.exist(requestPayload[0].level);
					requestPayload[0].level.should.equal('INFO');
					should.exist(requestPayload[0].message);
					requestPayload[0].message.should.equal('Status Report');
					should.exist(requestPayload[0].timestamp);
					requestPayload[0].timestamp.should.be.a.date;
					should.exist(requestPayload[0].test);

					return done();
				})
				.catch((err) => (done(err)));
		});
	});

	describe('#getAnalytics', () => {
		it('should properly get analytics (promise)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.get('/v0/devices/analytics')
				.reply(200, { test : true });

			device.getAnalytics()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly get analytics (callback)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.get('/v0/devices/analytics')
				.reply(200, { test : true });

			device.getAnalytics(function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly support options', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.get('/v0/devices/analytics?testing=yes')
				.reply(200, { test : true });

			device.getAnalytics({ testing : 'yes' }, function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#getDevice', () => {
		it('should require deviceId', (done) => {
			device.getDevice(function (err, result) {
				should.exist(err);
				should.not.exist(result);
				should.exist(err.message);
				err.message.should.equal('deviceId is required');

				return done();
			});
		});

		it('should properly get a device (promise)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.get('/v0/devices/test')
				.reply(200, { deviceId : 'test' });

			device.getDevice('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly get a device (callback)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.get('/v0/devices/test')
				.reply(200, { deviceId : 'test' });

			device.getDevice('test', function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly support options', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.get('/v0/devices/test?testing=yes')
				.reply(200, { deviceId : 'test' });

			device.getDevice('test', { testing : 'yes' }, function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#getDevices', () => {
		it('should require deviceIdList', (done) => {
			device.getDevices(function (err, result) {
				should.exist(err);
				should.not.exist(result);
				should.exist(err.message);
				err.message.should.equal('deviceIdList is required');

				return done();
			});
		});

		it('should properly get devices (promise)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.post('/v0/devices/deviceIds')
				.reply(200, { test : true });

			device.getDevices(['test'])
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly get devices (callback)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.post('/v0/devices/deviceIds')
				.reply(200, { test : true });

			device.getDevices(['test'], function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#getGroup', () => {
		it('should require groupId', (done) => {
			device.getGroup(function (err, result) {
				should.exist(err);
				should.not.exist(result);
				should.exist(err.message);
				err.message.should.equal('groupId is required');

				return done();
			});
		});

		it('should properly get a group (promise)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.get('/v0/groups/test')
				.reply(200, { deviceGroupId : 'test' });

			device.getGroup('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly get a group (callback)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.get('/v0/groups/test')
				.reply(200, { deviceGroupId : 'test' });

			device.getGroup('test', function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly support options', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.get('/v0/groups/test?testing=yes')
				.reply(200, { deviceGroupId : 'test' });

			device.getGroup('test', { testing : 'yes' }, function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#getGroupAnalytics', () => {
		it('should require groupId', (done) => {
			device.getGroupAnalytics(function (err, result) {
				should.exist(err);
				should.not.exist(result);
				should.exist(err.message);
				err.message.should.equal('groupId is required');

				return done();
			});
		});

		it('should properly get analytics (promise)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.get('/v0/groups/test/analytics')
				.reply(200, { test : true });

			device.getGroupAnalytics('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly get analytics (callback)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.get('/v0/groups/test/analytics')
				.reply(200, { test : true });

			device.getGroupAnalytics('test', function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly support options', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.get('/v0/groups/test/analytics?testing=yes')
				.reply(200, { test : true });

			device.getGroupAnalytics('test', { testing : 'yes' }, function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#getGroupDevices', () => {
		it('should require groupId', (done) => {
			device.getGroupDevices(function (err, result) {
				should.exist(err);
				should.not.exist(result);
				should.exist(err.message);
				err.message.should.equal('groupId is required');

				return done();
			});
		});

		it('should properly get analytics (promise)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.get('/v0/groups/test/devices')
				.reply(200, { test : true });

			device.getGroupDevices('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly get analytics (callback)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.get('/v0/groups/test/devices')
				.reply(200, { test : true });

			device.getGroupDevices('test', function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly support options', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.get('/v0/groups/test/devices?testing=yes')
				.reply(200, { test : true });

			device.getGroupDevices('test', { testing : 'yes' }, function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#getGroups', () => {
		it('should require groupIdList', (done) => {
			device.getGroups(function (err, result) {
				should.exist(err);
				should.not.exist(result);
				should.exist(err.message);
				err.message.should.equal('groupIdList is required');

				return done();
			});
		});

		it('should properly get groups (promise)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.post('/v0/groups/deviceGroupIds')
				.reply(200, { test : true });

			device.getGroups(['test'])
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly get groups (callback)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.post('/v0/groups/deviceGroupIds')
				.reply(200, { test : true });

			device.getGroups(['test'], function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#getGroupsAnalytics', () => {
		it('should require groupIdList', (done) => {
			device.getGroupsAnalytics(function (err, result) {
				should.exist(err);
				should.not.exist(result);
				should.exist(err.message);
				err.message.should.equal('groupIdList is required');

				return done();
			});
		});

		it('should properly get groups (promise)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.post('/v0/groups/analytics')
				.reply(200, { test : true });

			device.getGroupsAnalytics(['test'])
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly get groups (callback)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.post('/v0/groups/analytics')
				.reply(200, { test : true });

			device.getGroupsAnalytics(['test'], function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#version', () => {
		it('should properly return version (promise)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.get(/\/v[0-9]{1}\/version/i)
				.reply(200, { version : 'test' });

			device.version()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});

		it('should properly return version (callback)', (done) => {
			// intercept outbound request
			nock('https://device-api.apps.playnetwork.com')
				.get(/\/v[0-9]{1}\/version/i)
				.reply(200, { version : 'test' });

			device.version(function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});
});
