#!/usr/bin/env node
const
	os = require('os'),

	co = require('co'),

	lib = require('../lib'),
	nodePackage = require('../package.json'),

	ARGS_API_RE = /^(\-a|\-\-api)$/,
	ARGS_COMMAND_RE = /^(\-c|\-\-command)$/,
	ARGS_HELP_RE = /^(\-h|\-\-help)$/,
	COMMAND_ARGS_START = 2,
	JSON_REPLACER = 0,
	JSON_SPACE = 2;


module.exports = (function (app) {
	'use strict';

	function parseArgs () {
		let
			args = process.argv.slice(COMMAND_ARGS_START),
			showHelp = false;

		args.forEach((arg, index) => {
			if (ARGS_API_RE.test(arg)) {
				app.args.api = args[index + 1];

				return;
			}

			if (ARGS_COMMAND_RE.test(arg)) {
				app.args.command = args[index + 1];
				app.args.commandArgs = process.argv.slice(
					COMMAND_ARGS_START + COMMAND_ARGS_START + index);
				return;
			}

			if (ARGS_HELP_RE.test(arg)) {
				showHelp = true;
				return;
			}
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
		} else if (Object.keys(lib[app.args.api]).indexOf(app.args.command) < 0) {
			usage(`invalid usage: command specifed (${app.args.command}) is invalid`);
			return;
		}

		// show command specific help...
		if (showHelp) {
			// TODO: dafuq
		}
	}

	function usage (message) {
		message = message || '';

		console.log([
			`${app.args.program}: ${message}`,
			`usage: ${app.args.program} [-a | --api] [-c | --command] [-? | -h | --help]`,
			'    -a <api>',
			'    -c <command> <args>',
			'    -h',
			'',
			`command help: ${app.args.program} -a <api> -c <command> [-? | -h | --help]`,
			''
		].join(os.EOL));

		process.exit(0);
	}

	return co(function *() {
		lib.configure();

		// set the executable name
		app.args.program = Object.keys(nodePackage.bin)[0];

		// parse arguments
		parseArgs();

		// capture response from API call
		lib[app.args.api].on('response', (data) => app.response = data);

		// run it...
		return yield lib[app.args.api][app.args.command]
			.apply(null, app.args.commandArgs)
			.then((result) => {
				if (!result) {
					console.log(JSON.stringify(app.response, JSON_REPLACER, JSON_SPACE));

					return Promise.resolve();
				}

				console.log(JSON.stringify(result, JSON_REPLACER, JSON_SPACE));

				return Promise.resolve();
			})
			.catch((err) => console.error([
				`error: \`${app.args.program} -a ${app.args.api} -c ${app.args.command} ${app.args.commandArgs.join(' ')}\`:`,
				`\t${err.message}`
			].join(os.EOL)));
	}).catch((err) => {
		console.error(err);
	});
}({
	args : {}
}));
