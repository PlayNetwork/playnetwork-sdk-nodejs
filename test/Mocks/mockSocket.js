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

		if (configOpts.notifySubscriber.playerRpc) {
			setTimeout(function() {
				MockSocket.prototype.emit.call(self, 'playerRpc', configOpts.notifySubscriber.playerRpc.message);
			}, configOpts.notifySubscriber.playerRpc.occursAt);
		}
	}

	MockSocket.prototype = new events.EventEmitter();

	MockSocket.prototype.disconnect = () => {
		return MockSocket.prototype.emit.call(self, 'disconnect');
	};

	self = new MockSocket(opts);
	return self;
};
