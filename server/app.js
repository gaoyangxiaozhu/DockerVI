/**
 * Main application file
 */

'use strict';

// 设置默认环境变量
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var express = require('express');
var config = require('./config/env');
var path = require('path');
var fs = require('fs');
var mysql = require('mysql');

var app = express();
var server = require('http').createServer(app);

require('./config/express')(app);
require('./routes')(app);
require('./socket')(server);
//Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

exports = module.exports = app;
