(function () {
  'use strict';

  angular.module('dockerApp.resources')
    .factory('Cluster', function($resource){
      var clustersResource = $resource('/api/cluster/');
      return {
        getClusterList : function(data, callback){
          var cb = callback || angular.noop;
          return clustersResource.get(function(result) {
                        return cb(result);
                }, function(err) {
                        return cb(err);
                }).$promise;
        }
     };
    });
})();
