/**
 * @author gaoyangyang
 * @description
 * 镜像相关的操作
 */
'use strict';

var _ = require('lodash');
var request = require('superagent');
var endpoint = require('../endpoint').SWARMADDRESS;

exports.getImagesList = function(req, res){

	var url = endpoint + '/images/json';
	var itemsPerPage = (parseInt(req.query.itemsPerPage) > 0)?parseInt(req.query.itemsPerPage):10;
	var currentPage = (parseInt(req.query.currentPage) > 0)?parseInt(req.query.currentPage):1;

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

exports.getImagesCount = function(req, res){
	
	var url = endpoint + '/images/json';
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
exports.deleteImage = function(req ,res){

	var id = req.params.id;
	var url = endpoint + '/images/' + id;
	request.del(url)
	.then(function(response){
			if(!request.ok){
					throw new Error("error");
			}
			res.send({ data : 'success'});
	}).fail(function(err){
			res.send({'error_msg': 'error'});
	});
};
