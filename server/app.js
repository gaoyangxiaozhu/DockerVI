/**
 * Main application file
 */

'use strict';

// 设置默认环境变量
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var express = require('express');
var host = require('../Deploy/config').host;
var config = require('./config/env');
var path = require('path');
var fs = require('fs');
var mysql = require('mysql');
var mongoose = require('mongoose');

//连接mongoose数据库
mongoose.connect(config.mongo.uri, config.mongo.options);

var modelsPath = path.join(__dirname, 'model');
fs.readdirSync(modelsPath).forEach(function (file) {
	if (/(.*)\.(js$|coffee$)/.test(file)) {
		require(modelsPath + '/' + file);
	}
});

// 初始化数据
if(config.seedDB) { require('./config/seed'); }

var app = express();
var server = require('http').createServer(app);

require('./config/express')(app);

require('./routes')(app);
require('./socket')(9090);
//Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

exports = module.exports = app;
