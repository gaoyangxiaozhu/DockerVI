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
                  id:'getImagesList'
              },
               isArray: true
          },
          getImagesCount:{
              method: 'GET',
              params: {
                  id: 'getImagesCount'
              }
          }
        });
      return {
        getImagesList : function(data, callback){
          var cb = callback || angular.noop;
          return imagesResource. getImagesList(function(result) {
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
