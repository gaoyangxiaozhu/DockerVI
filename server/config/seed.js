/**
 * 初始化数据
 */

'use strict';

var mongoose = require('mongoose'),
	User = mongoose.model('User');
var Promise = require('bluebird');

//初始化用户
if(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'){
	User.countAsync().then(function (count) {
			if(count === 0){
			   User.removeAsync().then(function () {
				   User.createAsync({
					   nickname:'gyy',
					   email:'gyyzyp@163.com',
					   role:'admin',
					   password:'admin',
					   status:1
				   });
			   });
		   }
	   });
}
