#!/usr/bin/env node
const
	os = require('os'),
	stream = require('stream'),

	co = require('co'),

	lib = require('../lib'),
	nodePackage = require('../package.json'),

	ARGS_API_RE = /^(\-a|\-\-api)$/,
	ARGS_COMMAND_RE = /^(\-c|\-\-command)$/,
	ARGS_HELP_RE = /^(\-?\?|\-h|\-\-help)$/,
	ARGS_STREAM_RE = /^(\-s|\-\-stream)$/,
	ARGS_VERBOSE_RE = /^\-v$/,
	COMMAND_ARGS_START = 2,
	JSON_REPLACER = 0,
	JSON_SPACE = 2;


module.exports = (function (app) {
	'use strict';

	function parseArgs () {
		let
			args = process.argv.slice(COMMAND_ARGS_START),
			showHelp = false;

		args.some((arg, index) => {
			if (ARGS_API_RE.test(arg)) {
				app.args.api = args[index + 1];

				// continue processing command inputs
				return false;
			}

			if (ARGS_COMMAND_RE.test(arg)) {
				app.args.command = args[index + 1];
				app.args.commandArgs = args.slice(COMMAND_ARGS_START + index);

				// stop processing command inputs
				return true;
			}

			if (ARGS_HELP_RE.test(arg)) {
				showHelp = true;

				// stop processing command inputs
				return true;
			}

			if (ARGS_STREAM_RE.test(arg)) {
				app.args.pipedData = true;

				// continue processing command inputs
				return false;
			}

			if (ARGS_VERBOSE_RE.test(arg)) {
				app.args.verbose = true;

				// continue processing command inputs
				return false;
			}

			// continue processing
			return false;
		});

		// show generic usage
		if (showHelp && !app.args.command) {
			usage();
			return;
		}

		// validate api
		if (!app.args.api) {
			usage('invalid usage: api is required');
			return;
		} else if (Object.keys(lib).indexOf(app.args.api) < 0) {
			usage(`invalid usage: api specifed (${app.args.api}) is invalid`);
			return;
		}

		// validate command
		if (!app.args.command) {
			usage('invalid usage: command is required');
			return;
		} else {
			let libCmd = (() => {
				var libCmd = lib[app.args.api];
				app.args.command.split('.').forEach((current) => {
					libCmd = (libCmd && libCmd[current]) ? libCmd[current] : null;
				});
				return libCmd;
			})();
	
			if (!libCmd) {
				usage(`invalid usage: command specifed (${app.args.command}) is invalid`);
				return;
			}
		}

		// show command specific help...
		if (showHelp) {
			// TODO: build support for command specific help
		}
	}

	function parsePipeData () {
		return new Promise((resolve, reject) => {
			let chunks = [];

			// begin reading piped input...
			process.stdin.setEncoding('utf8');
			process.stdin.resume();

			// capture the input
			process.stdin.on('data', (chunk) => chunks.push(chunk));

			// parse and continue...
			process.stdin.on('end', () => {
				if (chunks.length) {
					try {
						app.args.commandArgs.push(JSON.parse(chunks.join('')));
					} catch (ex) {
						return reject(ex);
					}
				}

				return resolve();
			});

			// handle problems
			process.stdin.on('error', reject);
		});
	}

	function usage (message) {
		message = message || '';

		console.log([
			`${app.args.program}: ${message}`,
			`usage: ${app.args.program} [-s] [-a | --api] [-c | --command] [-? | -h | --help]`,
			'    -s                   - specify pipe mode for input stream',
			'    -a <api>             - the API to use',
			'    -c <command> <args>  - the command and arguments to supply',
			'    -h                   - help',
			'    -v                   - verbose',
			''
		].join(os.EOL));

		process.exit(message ? 1 : 0);
	}

	return co(function *() {
		lib.configure();

		// set the executable name
		app.args.program = Object.keys(nodePackage.bin)[0];

		// parse program inputs
		parseArgs();

		if (app.args.pipedData) {
			yield parsePipeData();
		}

		// capture request and response for API call for verbosity
		if (app.args.verbose) {
			lib[app.args.api].on('request', (data) => {
				console.log([
					'request:',
					JSON.stringify(data, JSON_REPLACER, JSON_SPACE),
					''].join(os.EOL));
			});

			lib[app.args.api].on('response', (data) => {
				console.log([
					'response:',
					JSON.stringify(data, JSON_REPLACER, JSON_SPACE),
					''].join(os.EOL));
			});
		}

		// run it...
		let libCmd = (() => {
			var libCmd = lib[app.args.api];
			app.args.command.split('.').forEach((current) => {
				libCmd = libCmd[current];
			});
			return libCmd;
		})();

		return yield libCmd
			.apply(null, app.args.commandArgs)
			.then((result) => {
				if (!result) {
					return Promise.resolve();
				}

				if (result instanceof stream.Stream) {
					// pipe the result to stdout
					result.pipe(process.stdout);
				} else {
					// log the response from the API call
					console.log(JSON.stringify(result, JSON_REPLACER, JSON_SPACE));
				}

				return Promise.resolve();
			})
			.catch((err) => {
				console.error([
					`error: \`${app.args.program} -a ${app.args.api} -c ${app.args.command} ${app.args.commandArgs.join(' ')}\`:`,
					`\t${err.message}`,
					''].join(os.EOL));

				return Promise.reject();
			});
	})
	.catch((err) => {
		if (err) {
			console.error(err);
		}

		return process.exit(1)
	});
}({
	args : {}
}));
