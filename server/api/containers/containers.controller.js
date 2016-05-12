/**
 * @author gaoyangyang
 * @description
 * 容器相关的操作
 */
var request = require('../../components/superagent');
var Q = require('q');
var express = require('express');
var endpoint = require('../endpoint').SWARMADDRESS;


exports.getContainerList = function(req, res){

	var currentPage = (parseInt(req.query.currentPage) > 0)?parseInt(req.query.currentPage):1;
	var itemsPerPage = (parseInt(req.query.itemsPerPage) > 0)?parseInt(req.query.itemsPerPage):10;

	var url = endpoint + '/containers/json?all=1';

	request.get(url)
	.then(function(response){
			var _data = request.body;
			if(!request.ok){
					throw new Error("error");
			}
			//返回当前需要的数据
			_data = _data.slice((currentPage-1)*10, (currentPage-1)*10 + itemsPerPage);
			res.send(_data);

	}).fail(function(err){
			res.send({'error_msg': 'error'});
	});
};
exports.getContainerCount = function(req, res){
	var url = endpoint + '/containers/json?all=1';

	request.get(url)
	.then(function(response){
			var _data = request.body;
			if(!request.ok){
					throw new Error("error");
			}
			res.send({data : _data.length });
	}).fail(function(err){
			res.send({'error_msg': 'error'});
	});

};
exports.getContainer = function(req, res){

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
exports.deleteContainer = function(req, res){
	var id = req.params.id;
	var action = 'delete';
	operateContainer(req, res, id, 'delete');
};
exports.updateContainer = function(req, res){
	var id = req.params.id;
	var action = req.body.action;
	operateContainer(req, res, id, action);
};

function operateContainer(req, res, id, action){

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
}
