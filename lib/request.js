var
	events = require('events'),
	http = require('http'),
	https = require('https'),
	qs = require('querystring'),
	util = require('util'),

	validation = require('./validation');

const
	DEFAULT_RETRY_COUNT = 3,
	DEFAULT_TIMEOUT = 30000,
	EVENT_REQUEST = 'request',
	EVENT_RESPONSE = 'response',
	FIRST_TRY = 1,
	HTTP_ERROR_CODE_THRESHHOLD = 400,
	HTTP_ERROR_CODE_RETRY_THRESHHOLD = 500,
	REQUEST_OPTIONS = [
		'agent',
		'auth',
		'family',
		'headers',
		'host',
		'hostname',
		'localAddress',
		'method',
		'path',
		'pathname',
		'port',
		'protocol',
		'query',
		'rejectUnauthorized',
		'maxRetries',
		'secure',
		'socketPath'];

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

		// apply filter parameters
		if (!validation.isEmpty(filters)) {
			// apply mandatory and optional filter parameters
			['mandatory', 'optional'].forEach((required) => {
				if (!validation.isEmpty(filters[required])) {
					Object.keys(filters[required]).forEach((match) => {
						Object.keys(filters[required][match]).forEach((field) => {
							let value = filters[required][match][field];
							if (!validation.isEmpty(value)) {
								formatted[`filters[${required}][${match}][${field}]`]= value;
							}
						});
					});
				}
			});

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

				// ensure default timeout is applied if one is not supplied
				augmented.timeout = augmented.timeout || DEFAULT_TIMEOUT;

				// ensure maxRetries is applied if one is not supplied
				augmented.maxRetries = augmented.maxRetries || DEFAULT_RETRY_COUNT;

				// create `path` from pathname and query.
				augmented.path = augmented.path || augmented.pathname;

				if (!validation.isEmpty(augmented.query)) {
					// format nested filters and sort params in bracket notation...
					augmented.query = formatQuery(augmented.query);

					// ensure arrays in querystring are properly serialized...
					Object.keys(augmented.query).forEach((param) => {
						if (Array.isArray(augmented.query[param]) && augmented.query[param].length > 1) {
							augmented.query[param] = augmented.query[param].join(',');
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

				let exec = new Promise(function (resolve, reject) {
					if (typeof data !== 'string') {
						data = JSON.stringify(data);
					}

					// apply content length header
					options.headers['Content-Length'] = Buffer.byteLength(data);

					// apply application/json header
					if (!options.headers['Content-Type']) {
						options.headers['Content-Type'] = 'application/json';
					}

					// provide request event
					if (_this.emit) {
						_this.emit(EVENT_REQUEST, options);
					}

					let makeRequest = function () {
						let req = (options.secure ? https : http).request(
							options,
							(res) => {
								let chunks = [];

								res.setEncoding('utf-8');

								res.on('data', (chunk) => (chunks.push(chunk)));

								res.once('end', () => {
									let
										body = chunks.join(''),
										context = {
											headers : res.headers,
											statusCode : res.statusCode
										},
										retry =
											context.statusCode >= HTTP_ERROR_CODE_RETRY_THRESHHOLD &&
											tryCount <= options.maxRetries;

									// provide response event
									if (_this.emit) {
										_this.emit(EVENT_RESPONSE, context);
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

									// handle retry if error code is above threshhold
									if (retry) {
										tryCount += 1;
										return makeRequest();
									}

									// handle other response errors
									if (context.statusCode >= HTTP_ERROR_CODE_THRESHHOLD) {
										return reject(body || '');
									}

									// resolve the request as complete
									return resolve(body || '');
								});
							});

						req.on('error', (err) => {
							// retry if below retry count threshhold
							if (tryCount <= options.maxRetries) {
								tryCount += 1;
								return makeRequest();
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

				// if a callback is supplied, use it
				if (callback) {
					return exec
						.then((data) => (callback(null, data)))
						.catch((err) => (callback(err)));
				}

				// fallback to return the promise
				return exec;
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
