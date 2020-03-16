const { URL } = require('url');

/**
 * Parse the input (URL string) to get its hostname, port, and protocol.
 * In the case that it's not parsable and it throws an error, return the an empty object.
 * We do this to preserve backward compatibility.
 * Note: this method assumes you are using either HTTP or HTTPS protocols.
 * @param   {String}    input   The URL.
 * @param   {Object}    output  An object containing host, port, and secure properties.
 * @returns {Object}    The object containing valid host, port, and secure keys based on the input.
 */
const parseURL = (input) => {
  const output = {};

  let url;
  try {
    url = new URL(input);
  } catch (e) {
    return output;
  }

  const { hostname, port, protocol } = url;

  output.host = hostname;
  output.port = port;
  output.secure = protocol === 'https:';

  return output;
};

module.exports = {
  parseURL
};
