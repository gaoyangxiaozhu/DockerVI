(function () {
  'use strict';

  angular.module('docker.resources')
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
          }
        });
      return {
        getImagesList : function(callback){
          var cb = callback || angular.noop;
          return containerResource.getContainerList(function(result) {
            return cb(result);
          }, function(err) {
            return cb(err);
          }).$promise;
        }
     };
    });
})();
