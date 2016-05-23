// image list page controller
(function(){
    angular.module("dockerApp.volume")
    .controller('volumeCtrl', ['$scope', '$location', 'Image', '$state', function($scope, $location, Image, $state){
        $scope.createVolume = function(){
            $state.go('volumeCreate');
        };
    }])
    .controller('volumeCreateCtrl', ['$scope', '$location', 'Image', '$state', function($scope, $location, Image, $state){


    }]);
})();
