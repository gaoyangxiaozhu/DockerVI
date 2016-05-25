/**
 * @author gaoyangyang
 * @description
 * 镜像相关的操作
 */
'use strict';

var _ = require('lodash');
var request = require('../../components/superagent');
var endpoint = require('../endpoint').SWARMADDRESS;

function _formtData(volumes){
	return volumes.map(function(item ,index){
		delete item.Labels;
		var nodeName = item.Name.split('/');
		item.fullName = nodeName[1];
		item.name = nodeName[1].slice(0, 15);
		item.node = nodeName[0];
		delete item.Name;
		return item;
	});
}
exports.getVolumesList = function(req, res){

	var url = endpoint + '/volumes';
	var itemsPerPage = (parseInt(req.query.itemsPerPage) > 0) ? parseInt(req.query.itemsPerPage) : 10;
	var currentPage = (parseInt(req.query.currentPage) > 0) ? parseInt(req.query.currentPage) : 1;

	request.get(url)
	.then(function(response){
		var volumes;
		var total;

		var _data = response.body;
		var _volumes = _data.Volumes;
		if(!response.ok){
			throw new Error("error");
		}
		//返回当前需要的数据
		try {

			total = _volumes.length;
			volumes = _volumes.slice((currentPage - 1) * 10, (currentPage - 1) * 10 + itemsPerPage);
			volumes = _formtData(_volumes);

			res.send({ volumes: volumes, total: total, msg: 'success'});
		} catch (e) {
			throw new Error(e);
		}

	}).fail(function(err){
			res.status(404).send({'error_msg': err.message});
	}).done();
};

exports.getVolumesCount = function(req, res){

	var url = endpoint + '/volumes';
	request.get(url)
	.then(function(response){
		var _data = response.body;
		if(!response.ok){
			throw new Error("error");
		}
		//返回当前需要的数据
		try {
			res.send(_data.length);
		} catch (e) {
			throw new Error(e);
		}
	}).fail(function(err){
			res.send({'error_msg': err.message});
	});
};
exports.getVolumesDetail = function(req, res){

	var id = req.params.id;
	var node = req.query.node;

	var url = endpoint + '/volumes/' + node + '/' + id;

	request.get(url)
	.then(function(response){
			if(!response.ok){
				throw new Error("error");
			}
			var _data = response.body;

			/*****format data*******/
			_data.Engine.Memory = _data.Engine.Memory / 1000 / 1000 / 1000;
			_data.Engine.Memory = _data.Engine.Memory.toFixed(2) + 'G';
			if(!_data.Engine.Labels.executiondriver){
				delete _data.Engine.Labels.executiondriver;
			}
			if(!_data.Labels){
				delete _data.Labels;
			}
			/*******end******/
			try {
				res.send(_data);
			} catch (e) {
				throw new Error(e);
			}

	}).fail(function(err){
			res.send({'error_msg': err.message});
	});

};
exports.createNewVolume = function(req, res){

	 var id = req.id;
	 var node = req.body.node;
	 var url = endpoint + '/volumes/create';
	 var postData = {};
	 postData.Name = node ? node + '/' + id : id;

	 request.post(url)
	 .then(function(response){
		 if(!response.ok){
			 throw new Error("error");
		 }
		 var _data = response.body;
		 try {
			 res.send({volume: _data, msg: 'success'});
		 } catch (e) {
			 throw new Error(e);
		 }
	 }).fail(function(err){
		 res.send({'error_msg': err.message});
	 });
};
exports.searchVolume = function(req, res){
	//TODO
	res.send('todo');
};
exports.deleteVolume = function(req ,res){

	var id = req.params.id;
	var url = endpoint + '/volumes/' + id;
	request.del(url)
	.then(function(response){
			if(!request.ok){
					throw new Error("error");
			}
			res.send({ msg : 'success'});
	}).fail(function(err){
			res.send({'error_msg': err.message});
	});
};
