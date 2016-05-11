(function(){
    angular.module("dockerApp")
    .controller('MainCtrl', ['$scope', '$location', 'resource', function($scope, $location, resource){

        $scope.getInfo = function(){
            function callBack(data){
                $scope.info = data.node_array;
            }
            resource.getInfo(callBack);
        };
        $scope.getInfo();

    }]);
})();
