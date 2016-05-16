// image list page controller
(function(){
    angular.module("dockerApp.cluster")
    .controller('clusterCtrl', ['$scope', '$location', 'Cluster', function($scope, $location, Cluster){
        $scope.clusterList =[];
        Cluster.getClusterList().then(function(results){
            $scope.clusterList = results.nodeArray;
            $scope.containerNums = results.containerNums;
            $scope.imageNums = results.imageNums;
        });
    }]);
})();
