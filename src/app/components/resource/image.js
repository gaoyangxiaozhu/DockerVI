(function () {
  'use strict';

  angular.module('dockerApp.resources')
    .factory('Image', function($resource){
      var containerResource = $resource('/api/images/:id/:controller', {
          id: '@_id'
        },
        {
          //添加标签分类
          getImagesList: {
              method: 'GET',
              params: {
                  id:'getImagesList'
              }
          },
          getImagesCount:{
              method: 'GET',
              params: {
                  id: 'getImagesCount'
              }
          }
        });
      return {
        getImagesList : function(callback){
          var cb = callback || angular.noop;
          return imagesResource.getContainerList(function(result) {
                        return cb(result);
                }, function(err) {
                        return cb(err);
                }).$promise;
        },
        getImagesCount : function(callback){
            var cb = callback || angular.noop;
            return imagesResource.getContainerList(function(result) {
                          return cb(result);
                  }, function(err) {
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
