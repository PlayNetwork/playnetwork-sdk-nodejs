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

      result = url.parseURL('');
      result.should.deep.equal({});

      result = url.parseURL(null);
      result.should.deep.equal({});
    });

    it('should return an empty object on invalid input', function() {
      let result = url.parseURL('');
      result.should.deep.equal({});

      result = url.parseURL('             ');
      result.should.deep.equal({});

      result = url.parseURL('this is not a url');
      result.should.deep.equal({});

      result = url.parseURL(':8080');
      result.should.deep.equal({});

      result = url.parseURL(null);
      result.should.deep.equal({});
    });

    it('assumes secure protocol if it is not provided in the url', function() {
      let result = url.parseURL('example.com:12345');
      result.host.should.equal('example.com');
      result.port.should.equal('12345');
      result.secure.should.be.true;

      result = url.parseURL('localhost');
      result.host.should.equal('localhost');
      result.port.should.equal('');
      result.secure.should.be.true;

      result = url.parseURL('127.0.0.1');
      result.host.should.equal('127.0.0.1');
      result.port.should.equal('');
      result.secure.should.be.true;
    });
  });
});
