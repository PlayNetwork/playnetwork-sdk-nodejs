module.exports = (function (self) {
	'use strict';

	self.coalesce = function () {
		return Array
			.prototype
			.slice
			.call(arguments)
			.filter((value) => (!self.isEmpty(value)))[0];
	};

	self.isEmpty = (value) => (value === null || [
		typeof value === 'undefined',
		typeof value === 'string' && !value.length,
		Array.isArray(value) && !value.length,
		typeof value === 'object' && !Object.keys(value).length
	].some((result) => (result)));

	return self;

}({}));
