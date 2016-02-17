var
	chai = require('chai'),
	nock = require('nock'),

	validation = require('../../lib/validation'),

	should = chai.should();


describe('validation', () => {
	'use strict';

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
	});
});
