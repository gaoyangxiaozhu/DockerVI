/**
 * @author gaoyangyang
 * @description
 * 容器相关的操作
 */
'use strict';
var request = require('../../components/superagent');
var Q = require('q');
var express = require('express');
var endpoint = require('../endpoint').SWARMADDRESS;

var rawLogText = null; //存放当前容器相关信息

exports.list = function(req, res){
	var url = endpoint + '/containers/json?all=1';
	request.get(url)
	.then(function(response){
			var _data = request.body;
			if(!request.ok){
					throw new Error("error");
			}
			res.send(_data);
	}).fail(function(err){
			res.send({'error_msg': 'error'});
	});
};
exports.details = function(req, res){
	var id = req.params.id;
	var url = endpoint + '/containers/' + id + '/json';
	request.get(url)
	.then(function(response){
			var _data = response.body;
			if(!response.ok){
					throw new Error("error");
			}
			res.send(_data);
	}).fail(function(err){
			res.send({'error_msg': 'error'});
	});
};
exports.actions = function(req, res){
	// 取出action & id
	var path = req.path.slice(1); //去除头部的'/'
	if(path[path.length - 1] == '/') path = path.slice(0,-1); //去除尾部的'/'
	var action = path.split('/')[1];
	var id = path.split('/')[2];

	var url = endpoint + '/containers/' + id;
	switch (action){
		case 'delete':
				request.del(url)
				.then(function(response){
						var _data = request.body;
						if(!request.ok){
								throw new Error("error");
						}
						res.send({ data : 'success'});
				}).fail(function(err){
						res.send({'error_msg': 'error'});
				});
			break;
		case 'start':
			url = url + '/start';

			request.post(url)
			.then(function(request){
				if(!request.ok){
						throw new Error("error");
				}
					res.send({'data': 'success'});
			}).fail(function(err){
					res.send({'error_msg': 'error'});
			});
			break;
		case 'stop':
			url = url + '/stop';
			request.post(url)
			.then(function(err, request){
					res.send({'data': 'success'});
			}).fail(function(err){
					res.send({'error_msg': 'error'});
			});
			break;
		default:
			url = url + 'restart';
			request.post(url)
			.then(function(request){
				res.send({'data': 'success'});
		 }).fail(function(err){
				 res.send({'error_msg': 'error'});
		 });
		 break;
	}

};
