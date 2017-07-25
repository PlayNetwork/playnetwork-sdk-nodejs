const events = require('events');

const CONNECT_DELAY = 1000;

module.exports = function (opts, self) {
	self = self ? self : {};

	let configOpts = opts ? opts : {
		notifySubscriber : {}
	};

	function MockSocket() {
		Object.create(this);

		if (configOpts.notifySubscriber.error) {
			setTimeout(function() {
				MockSocket.prototype.emit.call(self, 'error', new Error(configOpts.notifySubscriber.error.message));
			}, configOpts.notifySubscriber.error.occursAt);
		}

		if (configOpts.notifySubscriber.connect_error) {
			setTimeout(function() {
				MockSocket.prototype.emit.call(self, 'connect_error', new Error(configOpts.notifySubscriber.connect_error.message));
			}, configOpts.notifySubscriber.connect_error.occursAt);
		}

		if (configOpts.notifySubscriber.playerRpc) {
			setTimeout(function() {
				MockSocket.prototype.emit.call(self, 'playerRpc', configOpts.notifySubscriber.playerRpc.message);
			}, configOpts.notifySubscriber.playerRpc.occursAt);
		}

		if (configOpts.notifySubscriber.reconnect) {
			setTimeout(function() {
				MockSocket.prototype.emit.call(self, 'reconnect');
			}, configOpts.notifySubscriber.reconnect.occursAt);
		}

		if (configOpts.notifySubscriber.reconnect_attempt) {
			setTimeout(function() {
				MockSocket.prototype.emit.call(self, 'reconnect_attempt');
			}, configOpts.notifySubscriber.reconnect_attempt.occursAt);
		}

		if (configOpts.notifySubscriber.reconnecting) {
			setTimeout(function() {
				MockSocket.prototype.emit.call(self, 'reconnecting', configOpts.notifySubscriber.reconnecting.number);
			}, configOpts.notifySubscriber.reconnecting.occursAt);
		}

		if (configOpts.notifySubscriber.reconnect_error) {
			setTimeout(function() {
				MockSocket.prototype.emit.call(self, 'reconnect_error', new Error(configOpts.notifySubscriber.reconnect_error.message));
			}, configOpts.notifySubscriber.reconnect_error.occursAt);
		}
	}

	MockSocket.prototype = new events.EventEmitter();

	MockSocket.prototype.disconnect = () => {
		return MockSocket.prototype.emit.call(self, 'disconnect');
	};

	self = new MockSocket(opts);
	return self;
};
