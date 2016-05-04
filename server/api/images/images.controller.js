/**
 * @author gaoyangyang
 * @description
 * 镜像相关的操作
 */
'use strict';

var _ = require('lodash');
var request = require('superagent');
var endpoint = require('../endpoint').SWARMADDRESS;

exports.list = function(req, res){
	var url = endpoint + '/images/json';
	request
	.get(url)
	.end(function(err, request){
		if(err || !request.ok){
			res.send({'error_msg': 'error'});
		}
		var _data = request.body;
		res.send(_data);
	});
};
