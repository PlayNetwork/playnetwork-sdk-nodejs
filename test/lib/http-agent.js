/*eslint no-magic-numbers: 0*/
/*eslint no-unused-expressions: 0*/
const { expect } = require('chai');
const httpAgent = require('../../lib/http-agent');

describe('http-agent', () => {
	describe('connection pooling', () => {
		describe('https', () => {
			it('should allow connection pooling', () => {
				const isSecure = true;
				const allowPooling = true;
				const agent = httpAgent.getAgent(isSecure, allowPooling);

				// agent must allow connection pooling
				expect(agent.options.keepAlive).to.be.true;
			});

			it('should _not_ allow connection pooling', () => {
				const isSecure = true;
				const allowPooling = false;
				const agent = httpAgent.getAgent(isSecure, allowPooling);

				// if connection pooling is disabled then the keep alive field
				// will not exist
				expect(agent.options.keepAlive).to.be.undefined;
			});
		});

		describe('http', () => {
			it('should allow connection pooling', () => {
				const isSecure = false;
				const allowPooling = true;
				const agent = httpAgent.getAgent(isSecure, allowPooling);

				// agent must allow connection pooling
				expect(agent.options.keepAlive).to.be.true;
			});

			it('should _not_ allow connection pooling', () => {
				const isSecure = false;
				const allowPooling = false;
				const agent = httpAgent.getAgent(isSecure, allowPooling);

				// if connection pooling is disabled then the keep alive field
				// will not exist
				expect(agent.options.keepAlive).to.be.undefined;
			});
		});
	});

	describe('agents should be reused', () => {
		it('should reuse https agent', () => {
			const maxIterations = 5;
			const isSecure = true;
			const allowPooling = true;
			// get agent that should be reused
			const agent = httpAgent.getAgent(isSecure, allowPooling);

			// set a dummy param so that we can verify that next time the same
			// agent is returned.
			agent.foo = true;

			for (let i = 0; i < maxIterations; i++) {
				let fooAgent = httpAgent.getAgent(isSecure, allowPooling);
				expect(fooAgent.foo).to.be.true;
			}

		});

		it('should reuse http agent', () => {
			const maxIterations = 5;
			const isSecure = false;
			const allowPooling = true;

			// get agent that should be reused
			const agent = httpAgent.getAgent(isSecure, allowPooling);
			// set a dummy param so that we can verify that next time the same
			// agent is returned.
			agent.foo = true;

			for (let i = 0; i < maxIterations; i++) {
				let fooAgent = httpAgent.getAgent(isSecure, allowPooling);
				expect(fooAgent.foo).to.be.true;
			}
		});
	});
});
