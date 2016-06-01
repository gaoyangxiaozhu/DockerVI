/**
 * @author gaoyangyang
 * @description
 * 镜像相关的操作
 */
'use strict';

var _ = require('lodash');
var request = require('../../components/superagent');
var endpoint = require('../endpoint').SWARMADDRESS;



var _volumesList = []; //[{Name: node1/xxx}, ..., {Name:nodename/yyy}]


function _formtData(volumes){
	//volumes参数可能是_filterVList　也可能是获取的最原始的volumes列表
	return volumes.map(function(item ,index){
		if('Labels' in item){
			delete item.Labels;
		}
		if('W' in item){
			delete item.W;
		}
		var nodeName = item.Name.split('/');
		item.fullName = nodeName[1];
		item.name = nodeName[1].slice(0, 15);
		item.node = nodeName[0];
		delete item.Name;
		return item;
	});
}

function _getFilterVList(filterVList, node, name){
	var re;
	function _compare(a, b){
		return a.W - b.W;
	};
	_volumesList.forEach(function(item, index){
		var Name = item.Name;
		if(node){
			re = new RegExp(['.*', node, '.*/.*', name].join(''));
			if(Name.match(re)){
				var noRe = new RegExp(node);
				var naRe = new RegExp(name);
				var _indexForNo = Name.match(noRe).index;
				var _indexForNa = Name.match(naRe).index;
				var data = {
					Name: Name,
					W: _indexForNa + _indexForNo
				}
				filterVList.push(data);
			}
		}else{
			re = new RegExp(['.*', name].join(''));
			if(Name.match(re)){
				var _index = Name.match(re).index;
				var data = {
					Name: Name,
					W: _indexForNa
				}
				filterVList.push(data);
			}
		}
	});
	filterVList.sort(_compare);

}
exports.getVolumesList = function(req, res){


	var itemsPerPage = (parseInt(req.query.itemsPerPage) > 0) ? parseInt(req.query.itemsPerPage) : 10;
	var currentPage = (parseInt(req.query.currentPage) > 0) ? parseInt(req.query.currentPage) : 1;
	var name = req.query.name ? req.query.name.trim() : undefined;
	var node = req.query.node ? req.query.node.trim() : undefined;
	var url = endpoint + '/volumes';

	request.get(url)
	.then(function(response){
		if(!response.ok){
			throw new Error("error");
		}else{

			var volumes;
			var total;
			var _data = response.body;

			_volumesList = _data.Volumes.map(function(item, index){
				return {Name: item.Name};
			});

			var _filterVList = [];
			//返回当前需要的数据
			try {
				if(node || name){
					_getFilterVList(_filterVList, node, name);
				}else{
					_filterVList = _volumesList;
				}

				total = _filterVList.length;
				volumes = _filterVList.slice((currentPage - 1) * 10, (currentPage - 1) * 10 + itemsPerPage);
				volumes = _formtData(_filterVList);

				res.send({ volumes: volumes, total: total, msg: 'success'});
			} catch (e) {
				throw new Error(e);
			}
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
