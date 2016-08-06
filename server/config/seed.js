/**
 * 初始化数据
 */

'use strict';

var mongoose = require('mongoose'),
	User = mongoose.model('User');
var Promise = require('bluebird');

//初始化用户(seedDB=true) 默认只有一个admin用户

User.countAsync().then(function (count) {
	if(count === 0){
	   User.removeAsync().then(function () {
		   User.createAsync({
			   nickname:'admin',
			   email:'gyycoder@gmail.com',
			   role:'admin',
			   password:'admin',
			   status:1
		   });
	   });
   }
   });
