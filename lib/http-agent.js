/**
 * This module limits the created of http.Agent instances to only one that
 * allows connection pooling and another one that does not.
 * The agents will be created on demand the first time and then the instances
 * will be returned on subsequent calls to the getAgent method.
 */
const http = require('http');
const https = require('https');

const DEFAULT_KEEP_ALIVE_MSECS = 60000;
const DEFAULT_KEEP_ALIVE_MAX_SOCKETS = 32;
const DEFAULT_KEEP_ALIVE_MAX_FREE_SOCKETS = 32;

const HTTP_AGENT = 'http';
const HTTPS_AGENT = 'https';

const keepAliveAgent = {};
const defaultAgent = {};

/**
 * Retuns a new instance of the http.Agent
 * @param {Boolean} isSecure is https?
 * @param {Object} [options] can contain
 *  - options.keepAlive {Boolean}
 *  - options.keepAliveMsecs {Integer}
 *  - options.maxSockets  {Integer}
 *  - options.maxFreeSockets {Integer}
 *
 * @returns {http.Agent} Agent
 */
function createAgent(isSecure, options = {}) {
	return new (isSecure ? https : http).Agent(options);
}

/**
 * Returns an instance of the 'keep-alive' http.Agent that _ALLOWS_ connection
 * pooling
 * It will create a new instance only the first time is invoked
 * @param {Boolean} isSecure is https?
 *
 * @returns {http.Agent} Agent
 */
function getKeepAliveAgent(isSecure) {
	const agentType = isSecure ? HTTPS_AGENT : HTTP_AGENT;

	if (!keepAliveAgent[agentType]) {
		keepAliveAgent[agentType] = createAgent(isSecure, {
			keepAlive: true,
			keepAliveMsecs: DEFAULT_KEEP_ALIVE_MSECS,
			maxSockets: DEFAULT_KEEP_ALIVE_MAX_SOCKETS,
			maxFreeSockets: DEFAULT_KEEP_ALIVE_MAX_FREE_SOCKETS
		});
	}

	return keepAliveAgent[agentType];
}

/**
 * Returns an instance of the default http.Agent that _DOES_NOT_ allow
 * connection pooling
 * It will create a new instance only the first time is invoked
 * @param {Boolean} isSecure is https?
 *
 * @returns {http.Agent} Agent
 */
function getDefaultAgent(isSecure) {
	const agentType = isSecure ? HTTPS_AGENT : HTTP_AGENT;

	if (!defaultAgent[agentType]) {
		defaultAgent[agentType] = createAgent(isSecure);
	}

	return defaultAgent[agentType];
}

module.exports = {
	/**
	 * Returns the appropriate agent depending on the specified params
	 * @param {Boolean} isSecure is https?
	 * @param {Bollean} allowPooling should we keep connection alive?
	 *
	 * @returns {http.Agent} Agent
	 */
	getAgent: function (isSecure, allowPooling) {
		return allowPooling ?
			getKeepAliveAgent(isSecure) :
			getDefaultAgent(isSecure);
	}
};
