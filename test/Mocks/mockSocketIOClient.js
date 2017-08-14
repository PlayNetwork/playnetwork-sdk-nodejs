const events = require('events');
const mockSocket = require('./mockSocket')
const proxyquire = require('proxyquire');

const CONNECT_DELAY = 1000;

module.exports = ((self) => {
	self = self ? self : {};

	let socketConfigOptions;

	function MockSocketIOClient(url) {
		// call connect method after return the eventEmitter in order to
		// allow the events to be defined
		let socket = new mockSocket(socketConfigOptions);

		setTimeout(function() {
			socket.emit('connect', {
				"url" : url,
				"connectionAttempt" : 0
			});
		}, CONNECT_DELAY);

		return socket;
	}

	self.rewire = (modulePath, opts) => {
		socketConfigOptions = opts;

		return proxyquire(
			modulePath,
			{
				'socket.io-client' :  MockSocketIOClient
			});
	};

	return self;
})({});
