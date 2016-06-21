(function () {
  'use strict';

  angular.module('dockerApp.resources')
    .factory('Image', function($resource){
      var imagesResource = $resource('/api/images/:id/:controller', {
          id: '@_id'
        },
        {
          //添加标签分类
          getImagesList: {
              method: 'GET',
              params: {
                  controller: 'getImagesList'
              }
          },
          getImagesCount:{
              method: 'GET',
              params: {
                  controller: 'getImagesCount'
              }
          },
          getImageDetail:{
              method:'GET',
              params:{
                  controller: 'getImageDetail'
              }
          },
          searchDockerImage:{
              method:'GET',
              params:{
                  id: 'dockerhub',
                  controller: 'searchImage'
              }
          }
        });
      return {
        getImagesList : function(data, callback){
          var cb = callback || angular.noop;
          return imagesResource. getImagesList(data ,function(result) {
                        return cb(result);
                }, function(err) {
                        return cb(err);
                }).$promise;
        },
        getImagesCount : function(data, callback){
            var cb = callback || angular.noop;
            return imagesResource.getImagesCount(function(result) {
                          return cb(result);
                  }, function(err) {
                          return cb(err);
                  }).$promise;
        },
        getImageDetail : function(data, callback){
            var cb = callback || angular.noop;
            return imagesResource.getImageDetail(data, function(result){
                return cb(result);
            }, function(err){
                return cb(err);
            }).$promise;
        },
        searchDockerImage: function(data, callback){
            var cb = callback || angular.noop;
            return imagesResource.searchDockerImage(data, function(result){
                return cb(result);
            }, function(err){
                return cb(err);
            }).$promise;
        },
        deleteImage:function(data,callback){
            var cb = callback || angular.noop;
            return imagesResource.remove(data, function(result) {
                return cb(result);
            }, function(err) {
                return cb(err);
            }).$promise;
        }
     };
    });
})();
