/*eslint no-invalid-this: 0*/
/*eslint no-magic-numbers: 0*/
/*eslint no-unused-expressions: 0*/
var
	chai = require('chai'),
	nock = require('nock'),

	request = require('../../lib/request'),

	should = chai.should();


describe('request', () => {
	'use strict';

	describe('ctor', () => {
		it('should properly construct', () => {
			let
				req1 = new request.Request({
					host : 'one'
				}),
				req2 = new request.Request({
					host : 'two'
				});

			req1.settings().should.not.equal(req2.settings());
		});

		it('should be constructable without options...', () => {
			let req = new request.Request();

			should.exist(req.delete);
			should.exist(req.get);
			should.exist(req.head);
			should.exist(req.on);
			should.exist(req.post);
			should.exist(req.put);
			should.exist(req.settings);
			req.settings().should.be.empty;
		});

		it('should be constructable with options...', () => {
			let
				options = {
					host : 'develop-test-api.apps.playnetwork.com',
					secure : true
				},
				req = new request.Request(options);

			should.exist(req.delete);
			should.exist(req.get);
			should.exist(req.head);
			should.exist(req.on);
			should.exist(req.post);
			should.exist(req.put);
			should.exist(req.settings);
			req.settings().should.not.be.empty;
			req.settings().should.equal(options);
		});
	});

	describe('request methods', () => {
		['delete', 'get', 'head', 'post', 'put'].forEach((method) => {
			describe(`#${method}`, () => {
				let
					options = {
						host : `test-${method}.playnetwork.com`,
						secure : true
					},
					req = new request.Request(options),
					requestInfo,
					responseInfo,
					statusCode = ['delete', 'head'].indexOf(method) >= 0 ? 204 : 200;

				// capture request and response info
				req.on('request', (info) => (requestInfo = info));
				req.on('response', (info) => (responseInfo = info));

				afterEach(() => {
					nock.cleanAll();

					requestInfo = undefined;
					responseInfo = undefined;
				});

				it(`should properly ${method} (promise)`, () => {
					// intercept outbound request
					nock(`https://${options.host}`)[method]('/v0/tests')
						.reply(statusCode);

					return req[method]({ path : '/v0/tests' })
						.then((response) => {
							should.exist(response);
							response.should.be.empty;

							should.exist(requestInfo);
							should.exist(requestInfo.method);
							requestInfo.method.should.equal(method.toUpperCase());
							should.exist(requestInfo.path);
							requestInfo.path.should.equal('/v0/tests');

							should.exist(responseInfo);
						});
				});

				it(`should properly ${method} (callback)`, () => {
					// intercept outbound request
					nock(`https://${options.host}`)[method]('/v0/tests')
						.reply(statusCode);

					return req[method](
						{ path : '/v0/tests' },
						function (err, response) {
							should.not.exist(err);
							should.exist(response);
							response.should.be.empty;
							should.exist(requestInfo);
							requestInfo.method.should.equal(method.toUpperCase());
							should.exist(requestInfo.path);
							requestInfo.path.should.equal('/v0/tests');
							should.not.exist(requestInfo.query);
						});
				});

				it('should properly convert pathname and query to path', () => {
					// intercept outbound request
					nock(`https://${options.host}`)[method]('/v0/tests?array=1%2C2%2C3&testing=true')
						.reply(statusCode);

					return req[method]({
							pathname : '/v0/tests',
							query : {
								array : [1, 2, 3],
								testing : true
							}
						})
						.then((response) => {
							should.exist(response);
							response.should.be.empty;

							should.exist(requestInfo);
							should.exist(requestInfo.method);
							requestInfo.method.should.equal(method.toUpperCase());

							should.exist(requestInfo.path);
							requestInfo.path.should.contain('/v0/tests');

							should.exist(responseInfo);
						})
				});

				it('should properly handle non-parseable JSON response', (done) => {
					// intercept outbound request
					nock(`https://${options.host}`)[method]('/v0/tests/parse')
						.reply(statusCode, 'non-parseable');

					return req[method]({ path : '/v0/tests/parse' })
						.then(() => (done(new Error('failed parse test'))))
						.catch((err) => {
							should.exist(err);
							should.exist(err.body);
							err.body.should.equal('non-parseable');

							return done();
						});
				});

				it('should properly handle non-success status code', () => {
					// intercept outbound request
					let responseBody = { message : 'bad input', statusCode : 409 };

					nock(`https://${options.host}`)[method]('/v0/tests/status')
						.reply(responseBody.statusCode, responseBody);

					return req[method](
						{ path : '/v0/tests/status' },
						function (err, response) {
							should.exist(err);
							should.not.exist(response);
							should.exist(err.message);
							err.message.should.equal(responseBody.message);
						});
				});

				it('should properly retry on 500s', function (done) {
					// intercept outbound request
					let responseBody = { message : 'overload', statusCode : 503 };

					// fail twice
					nock(`https://${options.host}`)[method]('/v0/tests/retry')
						.times(2)
						.reply(responseBody.statusCode, responseBody);

					// succeed on 3rd retry
					nock(`https://${options.host}`)[method]('/v0/tests/retry')
						.times(1)
						.reply(200);

					return req[method](
						{ path : '/v0/tests/retry' },
						function (err, response) {
							should.not.exist(err);

							return done();
						});
				});

				it('should properly handle request errors', function (done) {
					// increase timeout for DNS resolution
					this.timeout(15000);

					return req[method]({ host : 'bad-host', path : '/' })
						.then(() => (done(new Error('failed request error test'))))
						.catch((err) => {
							should.exist(err);
							should.exist(err.code);
							err.code.should.equal('ENOTFOUND');

							return done();
						});
				});

				it('should obey timeout', function (done) {
					this.timeout(5000);

					nock(`https://${options.host}`)[method]('/v0/tests/timeout')
						.socketDelay(5000)
						.reply(200);

					let timeoutReq = new request.Request({
						host : options.host,
						secure : options.secure,
						timeout : 1000
					});

					return timeoutReq[method](
						{ path : '/v0/tests/timeout' },
						function (err, result) {
							should.exist(err);
							should.not.exist(result);

							return done();
						});
				});

				it('should serialize filters correctly', (done) => {
					nock(`https://${options.host}`)[method](/v0\/tests\/filters[.]*/)
						.reply(200);

					return req[method]({
						pathname : '/v0/tests/filters',
						query : {
							clientId : 'clientId',
							count : 100,
							filters : {
								diagnostics : ['online', 'offline'],
								field : ['field1', 'field2'],
								keyword : 'keyword',
								mandatory : {
									contains : {
										'm.contains' : 'middle'
									},
									endsWith : {
										'm.endsWith' : 'end'
									},
									exact : {
 										'm.exact' : 'exact'
									},
									exists : {
										'm.exists' : 'exists'
									},
									startsWith : {
 										'm.startsWith' : 'start'
									}
								},
								optional : {
									gte : {
										'o.gte' : 0
									},
									lte : {
										'o.lte' : 1
									},
									missing : {
										'o.missing' : 'missing'
									}
								}
							},
							sort : {
								asc : ['asc1', 'asc2'],
								desc : ['desc1', 'desc2']
							},
							start : 0,
							token : 'token'
						}
					}).then(() => {
						should.exist(requestInfo);
						should.exist(requestInfo.query);
						should.exist(requestInfo.query['filters[mandatory][contains][m.contains]']);
						requestInfo.query['filters[mandatory][contains][m.contains]'].should.equal('middle');
						should.exist(requestInfo.query['filters[mandatory][endsWith][m.endsWith]']);
						requestInfo.query['filters[mandatory][endsWith][m.endsWith]'].should.equal('end');
						should.exist(requestInfo.query['filters[mandatory][exact][m.exact]']);
						requestInfo.query['filters[mandatory][exact][m.exact]'].should.equal('exact');
						should.exist(requestInfo.query['filters[mandatory][exists][m.exists]']);
						requestInfo.query['filters[mandatory][exists][m.exists]'].should.equal('exists');
						should.exist(requestInfo.query['filters[mandatory][startsWith][m.startsWith]']);
						requestInfo.query['filters[mandatory][startsWith][m.startsWith]'].should.equal('start');
						should.exist(requestInfo.query['filters[optional][gte][o.gte]']);
						requestInfo.query['filters[optional][gte][o.gte]'].should.equal(0);
						should.exist(requestInfo.query['filters[optional][lte][o.lte]']);
						requestInfo.query['filters[optional][lte][o.lte]'].should.equal(1);
						should.exist(requestInfo.query['filters[optional][missing][o.missing]']);
						requestInfo.query['filters[optional][missing][o.missing]'].should.equal('missing');
						should.exist(requestInfo.query['filters[diagnostics]']);
						requestInfo.query['filters[diagnostics]'].should.equal('online,offline');
						should.exist(requestInfo.query['filters[field]']);
						requestInfo.query['filters[field]'].should.equal('field1,field2');
						should.exist(requestInfo.query['filters[keyword]']);
						requestInfo.query['filters[keyword]'].should.equal('keyword');
						should.exist(requestInfo.query['sort[asc]']);
						requestInfo.query['sort[asc]'].should.equal('asc1,asc2');
						should.exist(requestInfo.query['sort[desc]']);
						requestInfo.query['sort[desc]'].should.equal('desc1,desc2');

						return done();
					}).catch(done);
				});

				if (['post', 'put'].indexOf(method) >= 0) {
					it('should properly support input data', () => {
						// intercept outbound request
						nock(`https://${options.host}`)[method]('/v0/tests/data')
							.reply(statusCode, (uri, body) => {
								return body;
							});

						let data = {
							arrayValue : [1, 2, 3, 'a', 'b', 'c'],
							booleanValue : true,
							numberValue : 12345,
							stringValue : 'testing'
						};

						return req[method]({ path : '/v0/tests/data' }, data)
							.then((response) => {
								should.exist(response);
								response.should.not.be.empty;

								should.exist(requestInfo);
								should.exist(requestInfo.method);
								requestInfo.method.should.equal(method.toUpperCase());

								should.exist(requestInfo.path);
								requestInfo.path.should.equal('/v0/tests/data');

								should.exist(responseInfo);
							})
					});
				}
			});
		});
	});
});
