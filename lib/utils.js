const http = require('http');
const https = require('https');

const DEFAULT_KEEP_ALIVE_MSECS = 60000;
const DEFAULT_KEEP_ALIVE_MAX_SOCKETS = 32;
const DEFAULT_KEEP_ALIVE_MAX_FREE_SOCKETS = 32;

/**
 * Limits the creation of http.Agent instance to only one agent for keepAlive
 * connections and another one for 'non' keepAlive connections
 * The appropriate already created agent will be returned for any of the
 * subsequent calls to the methods so that the same agents are reused for
 * all requests
 */
module.exports.getHTTPAgent = (function () {
	let keepAliveAgent;
	let defaultAgent;

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
		if (!keepAliveAgent) {
			keepAliveAgent = createAgent(isSecure, {
				keepAlive: true,
				keepAliveMsecs: DEFAULT_KEEP_ALIVE_MSECS,
				maxSockets: DEFAULT_KEEP_ALIVE_MAX_SOCKETS,
				maxFreeSockets: DEFAULT_KEEP_ALIVE_MAX_FREE_SOCKETS
			});
		}

		return keepAliveAgent;
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
		if (!defaultAgent) {
			defaultAgent = createAgent(isSecure);
		}

		return defaultAgent;
	 }

	 return {
		default: getDefaultAgent,
		keepAlive: getKeepAliveAgent
	};
}());