'use strict';

var path = require('path');
var bunyan = require('bunyan');


var logger = bunyan.createLogger({
	name: 'docker-visual',
	serializers: {
	 req: bunyan.stdSerializers.req,
	 res: bunyan.stdSerializers.res,
	 err: bunyan.stdSerializers.err
	},
	streams: [
		{
			level: 'info',
			stream: process.stdout
		},{
			level: 'trace',
			stream: process.stdout
		},
		{
			level: 'debug',
			stream: process.stderr
		},{
			level: 'error',
			path: path.join(__dirname,'../../logs/' + process.env.NODE_ENV + '-' +'error.log')
		},{
			level:'fatal',
			path: path.join(__dirname,'../../logs/' + process.env.NODE_ENV + '-' +'fatal.log')
		},{
			level: 'warn',
			path: path.join(__dirname,'../../logs/' + process.env.NODE_ENV + '-' +'warn.log')
		}
	]
});

module.exports = logger;
