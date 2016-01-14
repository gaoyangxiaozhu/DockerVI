app.controller('resourceController', ['$scope', '$location', 'resource', function($scope, $location, resource){

    // 设置crumb 和 page-header
    $scope.type='resource'
    $scope.crumbOne = '资源监控'
    $scope.curmbOneLink= '#/resource'
    $scope.crumbTwo = '资源监控'
    $scope.headerSpan = '资源监控'
    $scope.headerDetail = '显示各个主机资源使用概况'

    $scope.getInfo = function(){
        function callBack(data){
            $scope.info = data.node_array;
        }
        resource.getInfo(callBack);
    };
    $scope.getInfo();

}]);
