module.exports = (function (self) {
	'use strict';

	self.isEmpty = (value) => (value === null || [
		typeof value === 'undefined',
		typeof value === 'string' && !value.length,
		Array.isArray(value) && !value.length,
		typeof value === 'object' && !Object.keys(value).length
	].some((result) => (result)));

	return self;

}({}));
