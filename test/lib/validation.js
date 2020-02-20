/*eslint no-magic-numbers: 0*/
/*eslint no-unused-expressions: 0*/
var
	chai = require('chai'),
	nock = require('nock'),

	validation = require('../../lib/validation'),

	should = chai.should();


describe('validation', () => {
	'use strict';

	describe('#applyOptionalParameters', () => {
		it('should properly return an empty object when input and output options are empty', () => {
			Object.keys(validation.applyOptionalParameters()).length.should.equal(0);
		});

		it('should properly return the output object when input options are empty', () => {
			validation.applyOptionalParameters(undefined, { test : true }).should.have.property('test');
			validation.applyOptionalParameters(undefined, { test : true }).test.should.be.true;
		});

		it('should properly return a valid output object when output options are empty', () => {
			var
				inputOptions = {
					agent : { proxy : true },
					host : 'develop-test-api.apps.playnetwork.com',
					maxRetries : 1,
					port : 8080,
					rejectUnauthorized : true,
					secure : true,
					timeout : 60000,
					totalTimeout: 5000,
					initialDelay: 50
				},
				outputOptions = validation.applyOptionalParameters(inputOptions);

			outputOptions.should.have.property('agent');
			outputOptions.agent.should.have.property('proxy');
			outputOptions.should.have.property('maxRetries');
			outputOptions.maxRetries.should.equal(1);
			outputOptions.should.have.property('port');
			outputOptions.port.should.equal(8080);
			outputOptions.should.have.property('rejectUnauthorized');
			outputOptions.rejectUnauthorized.should.equal(true);
			outputOptions.should.have.property('timeout');
			outputOptions.timeout.should.equal(60000);
			outputOptions.should.have.property('totalTimeout');
			outputOptions.totalTimeout.should.equal(5000);
			outputOptions.should.have.property('initialDelay');
			outputOptions.initialDelay.should.equal(50);

			should.not.exist(outputOptions.host);
			should.not.exist(outputOptions.secure);
		});

		it('should properly augment an existing output object with input options', () => {
			var
				inputOptions = {
					agent : { proxy : true },
					host : 'develop-test-api.apps.playnetwork.com',
					maxRetries : 1,
					port : 8080,
					rejectUnauthorized : true,
					timeout : 60000
				},
				outputOptions = validation.applyOptionalParameters(
					inputOptions,
					{
						host : 'develop-test-api.apps.playnetwork.com',
						secure : true
					});

			outputOptions.should.have.property('agent');
			outputOptions.agent.should.have.property('proxy');
			outputOptions.should.have.property('host');
			outputOptions.host.should.equal('develop-test-api.apps.playnetwork.com');
			outputOptions.should.have.property('maxRetries');
			outputOptions.maxRetries.should.equal(1);
			outputOptions.should.have.property('port');
			outputOptions.port.should.equal(8080);
			outputOptions.should.have.property('rejectUnauthorized');
			outputOptions.rejectUnauthorized.should.equal(true);
			outputOptions.should.have.property('secure');
			outputOptions.secure.should.equal(true);
			outputOptions.should.have.property('timeout');
			outputOptions.timeout.should.equal(60000);

			should.not.exist(outputOptions.totalTimeout);
			should.not.exist(outputOptions.initialDelay);
		});
	});

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
