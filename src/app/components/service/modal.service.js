(function () {
    'use strict';

    angular.module('dockerApp.service')
        .factory('CustomModalService', function ($modal) {
          return {
            open: function (ctrlName,url,size) {
                $modal.open({
                    templateUrl: url,
                    controller: ctrlName,
                    size: size
                });
            }
          };
        });
})();
