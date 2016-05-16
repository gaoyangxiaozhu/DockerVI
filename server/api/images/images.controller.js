/**
 * @author gaoyangyang
 * @description
 * 镜像相关的操作
 */
'use strict';

var _ = require('lodash');
var request = require('../../components/superagent');
var endpoint = require('../endpoint').SWARMADDRESS;


var formatData =function(data){
	  var images= [];
	  var imageName, imageTag, repo;
	  for(var index in data){
		  var item = data[index];
		  for(var index2 in item.RepoTags){
			  var isPrivate = false;
			  repo = item.RepoTags[index2];
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
					  image.repo = imagePrefixStrArray[0];
					  if(imagePrefixStrArray.length == 2){
						  //说明没有用户名　默认设置为gyyzyp
						  image.username = 'gyyzyp';
						  image.name = imagePrefixStrArray[1];
					  }else{
						  image.username = imagePrefixStrArray[1];
						  image.name = imagePrefixStrArray[2];
					  }
					  isPrivate = true;
				  }else{
					  //否则为官方仓库的个人镜像
					  image.repo = 'docker.io.com';
					  image.username = imagePrefixStrArray[0];
					  image.name = imagePrefixStrArray[1];
				  }
			  }
			  if(isPrivate){
				  break;
			  }
			 image.time = item.Created * 1000;
   		   	 image.size = item.VirtualSize;

			 var alreadyHas = false;
		 	 //  如果当前镜像和已经存入的镜像相同 则遗弃
		  	 for(var index3 in images){
				 var oldImage = images[index3];
				 if(oldImage.name.trim() == image.name.trim() && oldImage.tag.trim() == image.tag.trim()){
					 alreadyHas = true;
					 break;
			  	}
		  	}
			if(!alreadyHas){
				 images.push(image);
			}

		  }
	  }
	  return images;
  };

exports.getImagesList = function(req, res){

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
		_data = _data.slice((currentPage - 1) * 10, (currentPage - 1) * 10 + itemsPerPage);
		_data = formatData(_data);

		res.send(_data);

	}).fail(function(err){
			res.status(404).send({'error_msg': 'error'});
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
			res.send({count : _data.length });

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
