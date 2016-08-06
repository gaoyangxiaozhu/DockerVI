(function () {
	'use strict';

	angular.module('dockerApp.resources')
		.factory('User', function($resource){
			var userResource = $resource('/api/users/:id/:controller', {
					id: '@_id'
				},
				{
					getCaptcha:{
						method: 'GET',
						params: {
						  id:'getCaptcha'
						}
					},
					get: {
						method: 'GET',
						params: {
							id:'me'
						}
					},
					getUserList:{
						method:'GET',
						params:{
							id:'getUserList'
						}
					},
					addUser:{
						method:'POST',
						params:{
							id:'addUser'
						}
					},
					updateUser:{
						method:'PUT',
						params:{
							controller:'updateUser'
						}
					},
					mdUser:{
						method:'PUT',
						params:{
							id:'mdUser'
						}
					}
				});

			return {
				get:userResource.get,
                getCaptcha: function(callback){
			    var cb = callback || angular.noop;
			    return userResource.getCaptcha(function(result) {
			      return cb(result);
			    }, function(err) {
			      return cb(err);
			    }).$promise;
			  },
              getUserList:function (data,callback) {
                  var cb = callback || angular.noop;
                  return userResource.getUserList(function(result) {
                      return cb(result);
                  }, function(err) {
                      return cb(err);
			    }).$promise;
			  },
			  addUser:function (data, callback) {
                  var cb = callback || angular.noop;
                  return userResource.addUser(data, function(result) {
                      return cb(result);
                  }, function(err) {
                      return cb(err);
                  }).$promise;
			  },
			  deleteUser:function(data,callback){
                  var cb = callback || angular.noop;
                  return userResource.remove(data,function(result) {
                      return cb(result);
                  }, function(err) {
                      return cb(err);
			    }).$promise;
			  },
			  updateUser:function (id,data,callback) {
                  var cb = callback || angular.noop;
                  return userResource.updateUser({id:id}, data, function(result) {
                      return cb(result);
                  }, function(err) {
                      return cb(err);
                  }).$promise;
			  },
			  //前台更新用户信息
			  mdUser:function (data,callback) {
                  var cb = callback || angular.noop;
                  return userResource.mdUser(data,function(result) {
                      return cb(result);
                  }, function(err) {
                      return cb(err);
                  }).$promise;
			  }
			};
		});
})();
