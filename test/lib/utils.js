/*eslint no-magic-numbers: 0*/
/*eslint no-unused-expressions: 0*/
const { expect } = require('chai');
const utils = require('../../lib/utils');

describe('utils', () => {
	// the getHTTPAgent() function should create only an instance for http and for
	// https and should return the already created instance for every subsequent
	// request
	describe('getHttpAgent()', () => {
		describe('https', () => {
			it('should get keep alive agent', () => {
				const maxIterations = 5;
				const isSecure = true;

				// get agent that should be reused
				const agent = utils.getHTTPAgent.keepAlive(isSecure);
				// set a dummy param so that we can verify that next time the same
				// agent is returned.
				agent.foo = true;

				for (let i = 0; i < maxIterations; i++) {
					let fooAgent = utils.getHTTPAgent.keepAlive(isSecure);
					expect(fooAgent.foo).to.be.true;
				}
			});

			it('should get default agent', () => {
				const maxIterations = 5;
				const isSecure = true;

				// get agent that should be reused
				const agent = utils.getHTTPAgent.default(isSecure);
				// set a dummy param so that we can verify that next time the same
				// agent is returned.
				agent.foo = true;

				for (let i = 0; i < maxIterations; i++) {
					let fooAgent = utils.getHTTPAgent.default(isSecure);
					expect(fooAgent.foo).to.be.true;
				}
			});
		});

		describe('http', () => {
			it('should get keep alive agent', () => {
				const maxIterations = 5;
				const isSecure = false;

				// get agent that should be reused
				const agent = utils.getHTTPAgent.keepAlive(isSecure);
				// set a dummy param so that we can verify that next time the same
				// agent is returned.
				agent.foo = true;

				for (let i = 0; i < maxIterations; i++) {
					let fooAgent = utils.getHTTPAgent.keepAlive(isSecure);
					expect(fooAgent.foo).to.be.true;
				}
			});

			it('should get default agent', () => {
				const maxIterations = 5;
				const isSecure = false;

				// get agent that should be reused
				const agent = utils.getHTTPAgent.default(isSecure);
				// set a dummy param so that we can verify that next time the same
				// agent is returned.
				agent.foo = true;

				for (let i = 0; i < maxIterations; i++) {
					let fooAgent = utils.getHTTPAgent.default(isSecure);
					expect(fooAgent.foo).to.be.true;
				}
			});
		});
	});
});