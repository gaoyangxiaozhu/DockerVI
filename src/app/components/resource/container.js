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
                  controller:'getContainerList'
              },
              isArray: true
          },
          getContainerCount:{
            method: 'GET',
            params:{
                controller: 'getContainerCount'
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
          },
          getContainerStats:{
              method:'GET',
              params:{
                  controller: 'getContainerStats'
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
              return containerResource.getContainer(data, function(result) {
                  return cb(result);
              }, function(err) {
                  return cb(err);
              }).$promise;
          },
        createContainer : function (data, callback) {
            var cb = callback || angular.noop;
            return containerResource.createContainer(data, function(result) {
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
        },
        getContainerStats : function (data, callback) {
              var cb = callback || angular.noop;
              return containerResource.getContainerStats(data, function(result) {
                  return cb(result);
              }, function(err) {
                  return cb(err);
              }).$promise;
          },
      };

    });
})();
