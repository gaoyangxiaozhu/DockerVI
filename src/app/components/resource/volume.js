(function () {
  'use strict';

  angular.module('dockerApp.resources')
  .factory('Volume', function($resource){
      var volumesResource = $resource('/api/volumes/:id/:controller', {
          id: '@id'
        },
        {
          //添加标签分类
          getVolumesList: {
              method: 'GET',
              params: {
                  controller:'getVolumesList'
              }
          },
          getVolumesCount:{
              method: 'GET',
              params: {
                  controller: 'getVolumesCount'
              }
          },
          getVolumesDetail:{
              method:'GET',
              params:{
                  controller: 'getVolumesDetail'
              }
          },
          searchVolume:{
              method:'GET',
              params:{
                  controller: 'searchVolume'
              }
          }
        });
      return {
        getVolumesList : function(data, callback){
            var cb = callback || angular.noop;
          return volumesResource.getVolumesList(function(result) {
                    return cb(result);
                }, function(err) {
                        return cb(err);
                }).$promise;
        },
        getVolumesCount : function(data, callback){
            var cb = callback || angular.noop;
            return volumesResource.getVolumesCount(function(result) {
                          return cb(result);
                  }, function(err) {
                          return cb(err);
                  }).$promise;
        },
        getVolumesDetail : function(data, callback){
            var cb = callback || angular.noop;
            return volumesResource.getVolumesDetail(data, function(result){
                return cb(result);
            }, function(err){
                return cb(err);
            }).$promise;
        },
        createNewVolume : function(data, callback){
            var cb = callback || angular.noop;
            return volumesResource.save(data, function(result){
                return cb(result);
            }, function(err){
                return cb(err);
            }).$promise;
        },
        searchVolume: function(data, callback){
            var cb = callback || angular.noop;
            return volumesResource.searchVolume(data, function(result){
                return cb(result);
            }, function(err){
                return cb(err);
            }).$promise;
        },
        deleteVolume: function(data, callback){
            var cb = callback || angular.noop;
            return volumesResource.remove(data, function(result) {
                return cb(result);
            }, function(err) {
                return cb(err);
            }).$promise;
        }
     };
    });
})();
