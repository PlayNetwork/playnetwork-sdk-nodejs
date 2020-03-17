const { URL } = require('url');

const PROTOCOL_HTTP = 'http:';
const PROTOCOL_HTTPS = 'https:';

/**
 * Parse the input (URL string) to get its hostname, port, and protocol.
 * In the case that it's not parsable and it throws an error, return an empty object.
 * We do this to preserve backward compatibility.
 * Note: this method assumes you are using either HTTP or HTTPS protocols. It assumes HTTPS if protocol isn't provided.
 * @param   {String}    input   The URL.
 * @param   {Object}    output  An object containing host, port, and secure properties.
 * @returns {Object}    The object containing valid host, port, and secure keys based on the input.
 */
const parseURL = (input) => {
  const output = {};

  if (typeof(input) !== 'string') {
    return output;
  }

  input = input.trim();
  if (input === '') {
    return output;
  }

  if (!input.startsWith(PROTOCOL_HTTP) && !input.startsWith(PROTOCOL_HTTPS)) {
    input = PROTOCOL_HTTPS + input;
  }

  let url;
  try {
    url = new URL(input);
  } catch (e) {
    return output;
  }

  const { hostname, port, protocol } = url;

  output.host = hostname;
  output.port = port;
  output.secure = protocol === PROTOCOL_HTTPS;

  return output;
};

module.exports = {
  parseURL
};
