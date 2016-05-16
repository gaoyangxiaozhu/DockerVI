(function () {
  'use strict';

  angular.module('dockerApp.resources')
    .factory('Container', function($resource){
      var containerResource = $resource('/api/containers/:id/:controller', {
          id: '@_id'
        },
        {
          //添加标签分类
          getContainerList: {
              method: 'GET',
              params: {
                  id:'getContainerList'
              },
              isArray: true
          },
          getContainerCount:{
            method: 'GET',
            params:{
                id: 'getContainerCount'
            }
          },
          getContainer:{
              method: 'GET',
              params: {
                  controller:'getContainer'
              }
          },
          createContainer:{
              method:'POST',
              params:{
                  id:'createContainer'
              }
          },
          updateContainer:{
              method: 'POST',
              params: {
                  controller: 'updateContainer'
              }
          }

        });
      return {
        getContainerList : function(data, callback){
              var cb = callback || angular.noop;
              return containerResource.getContainerList(data, function(result) {
                  return cb(result);
              }, function(err) {
                  return cb(err);
              }).$promise;
          },
        getContainerCount : function(data, callback){
              var cb = callback || angular.noop;
              return containerResource.getContainerCount(data, function(result) {
                  return cb(result);
              }, function(err) {
                  return cb(err);
              }).$promise;
          },
        getContainer : function (data, callback) {
              var cb = callback || angular.noop;
              return containerResource.getContainer(data,function(result) {
                  return cb(result);
              }, function(err) {
                  return cb(err);
              }).$promise;
          },
        createContainer : function (id, data, callback) {
            var cb = callback || angular.noop;
            return containerResource.createContainer({ id : id }, data, function(result) {
                return cb(result);
            }, function(err) {
                return cb(err);
            }).$promise;
        },
        deleteContainer:function(data,callback){
            var cb = callback || angular.noop;
            return containerResource.remove(data, function(result) {
                return cb(result);
            }, function(err) {
                return cb(err);
            }).$promise;
        },
        //停止或运行容器
        updateContainer: function(data, callback){
            var cb = callback || angular.noop;
            return containerResource.updateContainer(data, function(result) {
                return cb(result);
            }, function(err) {
                return cb(err);
             }).$promise;
        }
      };

    });
})();
