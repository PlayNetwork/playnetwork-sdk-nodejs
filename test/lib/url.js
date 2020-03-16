/* eslint no-unused-expressions: 0 */

const url = require('../../lib/url');

describe('validation', () => {
	describe('#parseURL', function() {
		it('should return an object with host, port, and secure keys', function() {
			let result = url.parseURL('http://localhost:3000');
			result.host.should.equal('localhost');
			result.port.should.equal('3000');
			result.secure.should.be.false;

			result = url.parseURL('https://localhost');
			result.host.should.equal('localhost');
			result.port.should.equal('');
			result.secure.should.be.true;

			result = url.parseURL('https://example.com:12345');
			result.host.should.equal('example.com');
			result.port.should.equal('12345');
			result.secure.should.be.true;
		});
	});
});
