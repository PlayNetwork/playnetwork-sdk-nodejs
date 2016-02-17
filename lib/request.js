var
	events = require('events'),
	http = require('http'),
	https = require('https'),
	qs = require('querystring'),

	DEFAULT_TIMEOUT = 30000,
	EVENT_REQUEST = 'request',
	EVENT_RESPONSE = 'response';


// Ctor
module.exports = function (settings, self) {
	'use strict';

	// enable events
	self = Object.create(events.EventEmitter.prototype);
	events.EventEmitter.call(self);

	let
		augmentRequestOptions = (options) => {
			let augmented = {};

			// apply settings from Ctor
			Object.keys(settings).forEach((field) => {
				augmented[field] = settings[field];
			});

			// override with per request options
			Object.keys(options).forEach((field) => {
				augmented[field] = options[field];
			});

			// ensure default timeout is applied if one is not supplied
			augmented.timeout = augmented.timeout || DEFAULT_TIMEOUT;

			// create `path` from pathname and query.
			augmented.path = augmented.path || augmented.pathname;

			if (augmented.query && Object.keys(augmented.query).length) {
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
		exec = (options, data, callback) => {
			if (typeof data === 'function' && !callback) {
				callback = data;
				data = undefined;
			}

			data = data || '';
			options = augmentRequestOptions(options);
			options.headers = options.headers || {};


			let makeRequest = new Promise(function (resolve, reject) {
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
				if (self.emit) {
					self.emit(EVENT_REQUEST, options);
				}

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
								};

								// provide response event
							if (self.emit) {
								self.emit(EVENT_RESPONSE, context);
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
							if (context.statusCode >= 400) {
								return reject(body || '');
							}

							// resolve the request as complete
							return resolve(body || '');
						});
					});

				req.on('error', (err) => (reject(err)));

				// timeout the connection
				if (options.timeout) {
					req.setTimeout(options.timeout, () => (req.abort()));
				}

				// write data to the connection
				if (data) {
					req.write(data);
				}

				// signal end of request data
				req.end();
			});

			// if a callback is supplied, use it
			if (callback) {
				return makeRequest
					.then((data) => (callback(null, data)))
					.catch((err) => (callback(err)));
			}

			// fallback to return the promise
			return makeRequest;
		};

	self.delete = (options, callback) => {
		options = options || {};
		options.method = 'DELETE';

		return exec(options, callback);
	};

	self.get = (options, callback) => {
		options = options || {};
		options.method = 'GET';

		return exec(options, callback);
	};

	self.head = (options, callback) => {
		options = options || {};
		options.method = 'HEAD';

		return exec(options, callback);
	};

	self.post = (options, data, callback) => {
		options = options || {};
		options.method = 'POST';

		return exec(options, data, callback);
	};

	self.put = (options, data, callback) => {
		options = options || {};
		options.method = 'PUT';

		return exec(options, data, callback);
	};

	self.settings = () => {
		return settings || {};
	};

	return self;
};
