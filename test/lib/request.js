var
	chai = require('chai'),
	nock = require('nock'),

	Request = require('../../lib/request'),

	should = chai.should();


describe('request', () => {
	'use strict';

	describe('ctor', () => {
		it('should be constructable without options...', () => {
			let request = new Request();

			should.exist(request.delete);
			should.exist(request.get);
			should.exist(request.head);
			should.exist(request.on);
			should.exist(request.post);
			should.exist(request.put);
			should.exist(request.settings);
			request.settings().should.be.empty;
		});

		it('should be constructable with options...', () => {
			let
				options = {
					host : 'develop-test-api.apps.playnetwork.com',
					secure : true
				},
				request = new Request(options);

			should.exist(request.delete);
			should.exist(request.get);
			should.exist(request.head);
			should.exist(request.on);
			should.exist(request.post);
			should.exist(request.put);
			should.exist(request.settings);
			request.settings().should.not.be.empty;
			request.settings().should.equal(options);
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
					request = new Request(options),
					requestInfo,
					responseInfo,
					statusCode = ['delete', 'head'].indexOf(method) >= 0 ? 204 : 200;

				// capture request and response info
				request.on('request', (info) => (requestInfo = info));
				request.on('response', (info) => (responseInfo = info));

				afterEach(() => {
					nock.cleanAll();
				});

				it(`should properly ${method} (promise)`, () => {
					// intercept outbound request
					nock(`https://${options.host}`)
						[method]('/v0/tests')
						.reply(statusCode);

					return request[method]({ path : '/v0/tests' })
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
					nock(`https://${options.host}`)
						[method]('/v0/tests')
						.reply(statusCode);

					return request[method](
						{ path : '/v0/tests' },
						function (err, response) {
							should.not.exist(err);
							should.exist(response);
							response.should.be.empty;
							should.exist(requestInfo);
							requestInfo.method.should.equal(method.toUpperCase());
							should.exist(requestInfo.path);
							requestInfo.path.should.equal('/v0/tests');
						});
				});

				it('should properly convert pathname and query to path', () => {
					// intercept outbound request
					nock(`https://${options.host}`)
						[method]('/v0/tests?array=1%2C2%2C3&testing=true')
						.reply(statusCode);

					return request[method]({
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
					nock(`https://${options.host}`)
						[method]('/v0/tests/parse')
						.reply(statusCode, 'non-parseable');

					request[method]({ path : '/v0/tests/parse' })
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

					nock(`https://${options.host}`)
						[method]('/v0/tests/status')
						.reply(409, responseBody);

					request[method](
						{ path : '/v0/tests/status' },
						function (err, response) {
							should.exist(err);
							should.not.exist(response);
							should.exist(err.message);
							err.message.should.equal(responseBody.message);
						});
				});

				it('should properly handle request errors', function (done) {
					// increase timeout for DNS resolution
					this.timeout(15000);

					request[method]({ host : 'bad-host', path : '/' })
						.then(() => (done(new Error('failed request error test'))))
						.catch((err) => {
							should.exist(err);
							should.exist(err.code);
							err.code.should.equal('ENOTFOUND');

							return done();
						});
				});

				if (['post', 'put'].indexOf(method) >= 0) {
					it('should properly support input data', () => {
						// intercept outbound request
						nock(`https://${options.host}`)
							[method]('/v0/tests/data')
							.reply(statusCode, (uri, body) => {
								return body;
							});

						let data = {
							arrayValue : [1, 2, 3, 'a', 'b', 'c'],
							booleanValue : true,
							numberValue : 12345,
							stringValue : 'testing'
						};

						return request[method]({ path : '/v0/tests/data' }, data)
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
