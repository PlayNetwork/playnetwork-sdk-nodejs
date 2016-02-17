var
	events = require('events'),

	key = require('./key'),
	Request = require('./request');


module.exports = function (options, self) {
	'use strict';

	// enable events
	self = Object.create(events.EventEmitter.prototype);
	events.EventEmitter.call(self);

	

	return self;
};
