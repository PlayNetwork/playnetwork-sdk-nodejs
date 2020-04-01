var
	events = require('events'),
	http = require('http'),
	httpAgent = require('./http-agent'),
	https = require('https'),
	qs = require('querystring'),
	url = require('url'),
	validation = require('./validation'),
	util = require('util');

const
	DEFAULT_KEEP_ALIVE = true,
	DEFAULT_MAX_REDIRECT_COUNT = 5,
	DEFAULT_RETRY_COUNT = 3,
	DEFAULT_TIMEOUT = 30000,
	DEFAULT_DELAY = 30,
	EVENT_REDIRECT = 'redirect',
	EVENT_REQUEST = 'request',
	EVENT_RESPONSE = 'response',
	EXPONENT = 2,
	FIRST_TRY = 1,
	HTTP_ERROR_CODE_THRESHHOLD = 400,
	HTTP_ERROR_CODE_RETRY_THRESHHOLD = 500,
	// reference: https://en.wikipedia.org/wiki/List_of_HTTP_status_codes#3xx_Redirection
	HTTP_PROXY_REQUIRED = 305,
	HTTP_REDIRECT_CODE_PERM = 301,
	HTTP_REDIRECT_CODE_TEMP = 302,
	HTTP_REDIRECT_NEW_CODE_PERM = 308,
	HTTP_REDIRECT_NEW_CODE_TEMP = 307,
	REQUEST_OPTIONS = [
		'agent',
		'auth',
		'family',
		'headers',
		'host',
		'hostname',
		'initialDelay',
		'keepAlive',
		'keepAliveMsecs',
		'localAddress',
		'maxRetries',
		'method',
		'path',
		'pathname',
		'port',
		'protocol',
		'query',
		'rejectUnauthorized',
		'maxRetries',
		'rawStream',
		'secure',
		'socketPath',
		'timeout',
		'totalTimeout'],
	SECURE_PROTOCOL_RE = /^https/i;

// Ctor
module.exports = (function (self) {
	'use strict';

	function formatQuery (query) {
		let
			filters = query.filters,
			formatted = JSON.parse(JSON.stringify(query)),
			sort = query.sort;

		// remove filters and sort from return
		delete formatted.filters;
		delete formatted.sort;

		// apply filter parameters (requires special handling for bracket notation)
		if (!validation.isEmpty(filters)) {
			// apply mandatory and optional filter parameters
			['mandatory', 'optional'].forEach((clause) => {
				if (!validation.isEmpty(filters[clause])) {
					Object.keys(filters[clause]).forEach((match) => {
						// check for filters where the field name is the value
						if (['exists', 'missing'].indexOf(match) >= 0) {
							let value = filters[clause][match];

							// this is ugly. querystring.stringify translates
							// nulls to empty strings making it impossible to
							// differentiate between the two values. work around
							// the issue by pre-encoding nulls here
							if (value === null) {
								formatted[`filters[${clause}][${match}]`] = encodeURIComponent(value);
							} else if (!validation.isEmpty(value)) {
								formatted[`filters[${clause}][${match}]`] = value;
							}

							return;
						}

						// apply filters where field name is part of the filter param
						Object.keys(filters[clause][match]).forEach((field) => {
							let value = filters[clause][match][field];
							if (value === null) {
								formatted[`filters[${clause}][${match}][${field}]`] = encodeURIComponent(value);
							} else if (!validation.isEmpty(value)) {
								formatted[`filters[${clause}][${match}][${field}]`] = value;
							}
						});
					});
				}
			});

			// apply analytics filter parameter (for device-api)
			if (!validation.isEmpty(filters.analytics)) {
				formatted['filters[analytics]'] = filters.analytics;
			}

			// apply diagnostics filter parameter (for device-api)
			if (!validation.isEmpty(filters.diagnostics)) {
				formatted['filters[diagnostics]'] = filters.diagnostics;
			}

			// apply field filter parameter
			if (!validation.isEmpty(filters.field)) {
				formatted['filters[field]'] = filters.field;
			}

			// apply keyword filter parameter
			if (!validation.isEmpty(filters.keyword)) {
				formatted['filters[keyword]'] = filters.keyword;
			}
		}

		// apply sort parameters
		if (!validation.isEmpty(sort)) {
			Object.keys(sort).forEach((direction) => {
				if (!validation.isEmpty(sort[direction])) {
					formatted[`sort[${direction}]`] = sort[direction];
				}
			});
		}

		return formatted;
	}

	function isRetry(options, startTime, tryCount) {
		if (tryCount > options.maxRetries) {
			return false;
		}

		if (options.totalTimeout) {
			const timeElapsed = (new Date()) - startTime;
			return timeElapsed < options.totalTimeout;
		}
		
		return true;
	}

	function Request (settings) {
		let
			_this = this,
			augmentRequestOptions = (options) => {
				let augmented = {};

				// apply settings from Ctor
				REQUEST_OPTIONS.forEach((field) => {
					let value = validation.coalesce(options[field], settings[field]);

					if (!validation.isEmpty(value)) {
						augmented[field] = value;
					}
				});

				// ensure maxRetries is applied if one is not supplied
				augmented.maxRetries = validation.coalesce(
					augmented.maxRetries,
					DEFAULT_RETRY_COUNT);

				// ensure rawStream setting is applied if not supplied
				augmented.rawStream = validation.isEmpty(augmented.rawStream) ?
					false :
					augmented.rawStream;

				// ensure default timeout is applied if one is not supplied
				augmented.timeout = validation.coalesce(
					augmented.timeout,
					DEFAULT_TIMEOUT);

				augmented.keepAlive = validation.coalesce(
						augmented.keepAlive,
						DEFAULT_KEEP_ALIVE);

				// here we make sure that the appropriate http.Agent is used
				augmented.agent = httpAgent.getAgent(
					augmented.secure,
					augmented.keepAlive
				);

				// create `path` from pathname and query.
				augmented.path = validation.coalesce(
					augmented.path,
					augmented.pathname);

				if (!validation.isEmpty(augmented.query)) {
					// format nested filters and sort params in bracket notation...
					augmented.query = formatQuery(augmented.query);

					// serialization adjustments for querystring
					Object.keys(augmented.query).forEach((param) => {
						// ensure arrays in querystring are properly serialized...
						if (Array.isArray(augmented.query[param]) && augmented.query[param].length > 1) {
							augmented.query[param] = augmented.query[param].join(',');
							return;
						}

						// turn date objects into ISO strings
						if (augmented.query[param] instanceof Date) {
							augmented.query[param] = augmented.query[param].toISOString();
							return;
						}
					});

					augmented.path += `?${qs.stringify(augmented.query)}`;
				}

				return augmented;
			},
			exec = (options, data, tryCount, callback) => {
				if (typeof data === 'function' && validation.isEmpty(callback)) {
					callback = data;
					data = undefined;
					tryCount = FIRST_TRY;
				}

				if (typeof tryCount === 'function' && validation.isEmpty(callback)) {
					callback = tryCount;
					tryCount = FIRST_TRY;
				}

				data = data || '';
				options = augmentRequestOptions(options);
				options.headers = options.headers || {};
				tryCount = tryCount || FIRST_TRY;

				if (options.totalTimeout) {
					options.totalTimeout = Number(options.totalTimeout);
					options.initialDelay = Number(options.initialDelay);
					if (!options.initialDelay) {
						options.initialDelay = DEFAULT_DELAY;
					}
					if (options.totalTimeout > options.timeout) {
						options.totalTimeout = options.timeout;
					}
				}

				let
					exec,
					redirectCount = 0,
					retryWait = options.initialDelay || 0;

				exec = new Promise(function (resolve, reject) {
					const startTime = new Date();
					const delay = (retryWait) => new Promise((res) => setTimeout(res, retryWait));
					if (typeof data !== 'string') {
						data = JSON.stringify(data);
					}

					// apply content length header
					options.headers['Content-Length'] = Buffer.byteLength(data);

					// apply application/json header
					if (!options.rawStream && !options.headers['Content-Type']) {
						options.headers['Content-Type'] = 'application/json';
					}

					if (options.keepAlive && !options.headers['Connection']) {
						options.headers['Connection'] = 'keep-alive';
					}

					// provide request event
					if (_this.emit) {
						_this.emit(EVENT_REQUEST, options);
					}

					let makeRequest = function () {
						let req = (options.secure ? https : http).request(
							options,
							(res) => {
								let
									chunks = [],
									context = {
										headers : res.headers,
										statusCode : res.statusCode
									},
									redirect = [
										HTTP_REDIRECT_CODE_PERM,
										HTTP_REDIRECT_CODE_TEMP,
										HTTP_REDIRECT_NEW_CODE_PERM,
										HTTP_REDIRECT_NEW_CODE_TEMP
									].some((code) => (code === context.statusCode));

								// provide response event (as there are response headers)
								if (_this.emit) {
									_this.emit(EVENT_RESPONSE, context);
								}

								if (context.statusCode === HTTP_PROXY_REQUIRED) {
									let err = new Error('proxy server configuration required');
									err.options = options;
									err.response = context;

									return reject(err);
								}

								// check for HTTP redirect
								if (redirect) {
									if (validation.isEmpty(context.headers.location)) {
										let err = new Error('redirect requested with no location');
										err.options = options;
										err.response = context;

										return reject(err);
									}

									if (redirectCount >= DEFAULT_MAX_REDIRECT_COUNT) {
										let err = new Error('maximum redirect limit exceeded');
										err.options = options;
										err.response = context;

										return reject(err);
									}

									// remap options and redirect to supplied URL
									let redirectUrl = url.parse(context.headers.location);
									options = {
										host : redirectUrl.host || options.host || options.hostname,
										method : options.method,
										path : redirectUrl.path,
										pathname : redirectUrl.pathname,
										rawStream : options.rawStream,
										secure : (redirectUrl.protocol ?
											SECURE_PROTOCOL_RE.test(redirectUrl.protocol) :
											options.secure)
									};

									// increment number of redirects (to avoid endless looping)
									redirectCount ++;

									// emit redirect event
									_this.emit(EVENT_REDIRECT, options);

									// re-request based on the redirect location
									return setImmediate(makeRequest);
								}

								// for content-api requests (or other raw binary data requests)
								// rawStream may be set to true - in the event of this, return
								// the response directly
								if (options.rawStream) {
									if (context.statusCode >= HTTP_ERROR_CODE_THRESHHOLD) {
										let err = new Error('resource not found');
										err.context = context;

										return reject(err);
									}

									return resolve(res);
								}

								// standard API requests flow through below...
								res.setEncoding('utf-8');

								res.on('data', (chunk) => (chunks.push(chunk)));

								res.once('end', () => {
									let body = chunks.join('');
									const retry = context.statusCode >= HTTP_ERROR_CODE_RETRY_THRESHHOLD
										&& isRetry(options, startTime, tryCount);

									// handle retry if error code is above threshhold
									if (retry) {
										tryCount += 1;
										return delay(retryWait)
											.then(makeRequest)
											.then(() => {
												retryWait *= EXPONENT;
											});
									}

									// attempt to parse the body
									if (typeof body === 'string' && body.length) {
										try {
											body = JSON.parse(body);
										} catch (err) {
											err.body = body;
											err.context = context;

											return reject(err);
										}
									}

									// handle other response errors
									if (context.statusCode >= HTTP_ERROR_CODE_THRESHHOLD) {
										// reject with an error
										let err = new Error('unexpected response from server');

										// assign properties from the body to the error
										if (body && typeof body !== 'string') {
											err = Object.assign(err, body);
										}

										err.options = options;
										err.statusCode = context.statusCode;

										return reject(err);
									}

									// resolve the request as complete
									return resolve(body || '');
								});
							});

						req.on('error', (err) => {
							// retry if below retry count threshhold
							if (isRetry(options, startTime, tryCount)) {
								tryCount += 1;
								return delay(retryWait)
									.then(makeRequest)
									.then(() => {
										retryWait *= EXPONENT;
									});
							}

							return reject(err)
						});

						// timeout the connection
						if (options.timeout) {
							req.setTimeout(options.timeout, req.abort);
						}

						// write data to the connection
						if (data) {
							req.write(data);
						}

						// signal end of request data
						req.end();
					}

					// do it!
					makeRequest();
				});

				return validation.promiseOrCallback(exec, callback);
			};

		_this.delete = (options, callback) => {
			options = options || {};
			options.method = 'DELETE';

			return exec(options, callback);
		};

		_this.get = (options, callback) => {
			options = options || {};
			options.method = 'GET';

			return exec(options, callback);
		};

		_this.head = (options, callback) => {
			options = options || {};
			options.method = 'HEAD';

			return exec(options, callback);
		};

		_this.post = (options, data, callback) => {
			options = options || {};
			options.method = 'POST';

			return exec(options, data, callback);
		};

		_this.put = (options, data, callback) => {
			options = options || {};
			options.method = 'PUT';

			return exec(options, data, callback);
		};

		_this.settings = () => {
			return settings || {};
		};
	}

	// enable events
	util.inherits(Request, events.EventEmitter);

	// return the ability to create a new request
	self.Request = Request;

	return self;

}({}));
