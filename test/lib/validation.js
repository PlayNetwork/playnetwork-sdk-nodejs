/*eslint no-magic-numbers: 0*/
/*eslint no-unused-expressions: 0*/
var
	chai = require('chai'),
	nock = require('nock'),

	validation = require('../../lib/validation'),

	should = chai.should();


describe('validation', () => {
	'use strict';

	describe('#coalesce', () => {
		it('should properly return the first non-empty value', () => {
			validation.coalesce(null, null, null, 'value').should.equal('value');
			validation.coalesce(undefined, [], null, true).should.be.true;
			should.not.exist(validation.coalesce(undefined, undefined));
		});
	});

	describe('#isEmpty', () => {
		it('should properly detect blank strings', () => {
			validation.isEmpty('').should.be.true;
			validation.isEmpty('testing').should.be.false;
		});

		it('should properly detect blank objects', () => {
			validation.isEmpty({}).should.be.true;
			validation.isEmpty({ testing : true }).should.be.false;
		});

		it('should properly detect empty arrays', () => {
			validation.isEmpty([]).should.be.true;
			validation.isEmpty([1, 2, 3]).should.be.false;
		});

		it('should properly detect null values', () => {
			validation.isEmpty(null).should.be.true;
		});

		it('should properly detect undefined values', () => {
			validation.isEmpty(undefined).should.be.true;
		});

		it('should properly detect Date types', () => {
			validation.isEmpty(new Date()).should.be.false;
		});
	});
});
