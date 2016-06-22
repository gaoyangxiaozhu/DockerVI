/**
 * @author gaoyangyang
 * @description
 * 镜像相关的操作
 */
'use strict';

var _ = require('lodash');
var request = require('../../components/superagent');
var endpoint = require('../endpoint').SWARMADDRESS;


var formatRepoTag = function(repoTag){
	var isPrivate = false;
	var repo = repoTag;
	var imagePrefixStr = repo.slice(0, repo.lastIndexOf(':'));
	var image={};
	var imagePrefixStrArray= imagePrefixStr.split('/');
	//镜像标签
	image.tag = repo.slice(repo.lastIndexOf(':') + 1);
	if(imagePrefixStrArray.length == 1){
		// 说明是官方仓库的官方镜像
		image.repo = 'docker.io.com';
		image.username = 'docker';
		image.name = imagePrefixStrArray[0];
	}else{//说明不是官方镜像
		//RepoTags中的item可能为如"localhost:5000/busybox:latest"这种形式 此时为私有镜像
		var socket = imagePrefixStrArray[0].indexOf(':') >=0 ? true : false;
		//如果为true说明是私有仓库
		if(socket){
			isPrivate = true;
			image.repo = imagePrefixStrArray[0];
			if(imagePrefixStrArray.length == 2){
				//说明没有用户名　默认设置为gyyzyp
				image.username = 'gyyzyp';
				image.name = imagePrefixStrArray[1];
			}else{
				image.username = imagePrefixStrArray[1];
				image.name = imagePrefixStrArray[2];
			}

		}else{
			//否则为官方仓库的个人镜像
			image.repo = 'docker.io.com';
			image.username = imagePrefixStrArray[0];
			image.name = imagePrefixStrArray[1];
		}
	}
	image.isPrivate = isPrivate ? true : false;

	return image;

};
var formatSize =function(size){
	// K M G T
	switch (true){
		case size < 900000000 : return (size / 1000 / 1000).toFixed(2) + 'M';
		default: return (size / 1000 / 1000 / 1000).toFixed(2) + 'G';
	}
	return ;
};
var formatData =function(data){

	var images= [];
	var image ={};

	if(!(Object.prototype.toString.call(data) === '[object Object]' || Object.prototype.toString.call(data) === '[object Array]')){
		return {};
	}
	if(Object.prototype.toString.call(data) == '[object Object]'){
		image = formatRepoTag(data.RepoTags[0]);
		image.DockerVersion = data.DockerVersion;
		image.id = data.Id.split(':')[1].slice(0, 10);
		image.time = new Date(data.Created).getTime();
		image.size = formatSize(data.VirtualSize);
		return image;
	}

  	for(var index in data){
	  	var item = data[index];
		image = formatRepoTag(item.RepoTags[0]);
		image.id = item.Id.split(':')[1].slice(0, 10);
		image.fullId = item.Id.split(':')[1];
		image.time = item.Created * 1000;
		image.size = formatSize(item.VirtualSize);
		if(image.isPrivate) continue;
		images.push(image);
  	}
  return images;
 };
exports.getImagesList = function(req, res){


	//根据时间大小排序存储
	function cmp(a, b){
		if(a.time){
			return a.time < b.time;
		}
		return a.id < b.id;
	}
	var url = endpoint + '/images/json';

	var itemsPerPage = (parseInt(req.query.itemsPerPage) > 0) ? parseInt(req.query.itemsPerPage) : 10;
	var currentPage = (parseInt(req.query.currentPage) > 0) ? parseInt(req.query.currentPage) : 1;

	request.get(url)
	.then(function(response){
		var _data = response.body;
		if(!response.ok){
				throw new Error("error");
		}

		//返回当前需要的数据
		_data = formatData(_data);
		_data.sort(cmp);
		_data = _data.slice((currentPage - 1) * 10, (currentPage - 1) * 10 + itemsPerPage);

		res.send({msg: 'ok', results : _data});

	}).fail(function(err){
			res.send({error_msg: err.message, status: err.status});
	}).done();
};

exports.getImagesCount = function(req, res){

	var url = endpoint + '/images/json';
	request.get(url)
	.then(function(response){
			var _data = response.body;
			if(!response.ok){
					throw new Error("error");
			}
			res.send({msg: 'ok', count : _data.length });

	}).fail(function(err){
			res.send({error_msg: err.message, status: err.status});
	});
};
exports.getImageDetail = function(req, res){
	var id = req.params.id;
	var url = endpoint + '/images/' + id + '/' + 'json';
	request.get(url)
	.then(function(response){
			if(!response.ok){
					throw new Error("error");
			}
			var _data = response.body;
			try {
				_data = formatData(_data);
				res.send(_data);
			} catch (e) {
				throw new Error(e);
			}


	}).fail(function(err){
			res.send({'error_msg': err.message});
	});

};
exports.searchImage = function(req, res){
	var id = req.params.id;
	var content = req.query.content;
	var itemsPerPage = (parseInt(req.query.itemsPerPage) > 0) ? parseInt(req.query.itemsPerPage) : 10;
	var currentPage = (parseInt(req.query.currentPage) > 0) ? parseInt(req.query.currentPage) : 1;
	if(id == "dockerhub"){
		var url = endpoint + '/images/search?term=' + content;
		request.get(url)
		.then(function(response){
				if(!response.ok){
						throw new Error("error");
				}
				var _data = response.body;
				try {
					var dockerhubPAckagesList = _data.slice(0, itemsPerPage * currentPage);
					var total = _data.length;
					res.send({ msg: 'ok', dockerhubPAckagesList : dockerhubPAckagesList, total: total});
				} catch (e) {
					throw new Error(e);
				}


		}).fail(function(err){
			res.send({error_msg : err.message, status : err.status || 500 });
		});
	}


};
exports.deleteImage = function(req ,res){

	var id = req.params.id;
	var url = endpoint + '/images/' + id + '?force=1&noprune=1';
	request.del(url)
	.then(function(response){
			if(!response.ok){
				throw new Error("error");
			}
			res.send({ msg : 'ok'});
	}).fail(function(err){
			res.send({error_msg : err.message, status : err.status});
	});
};
