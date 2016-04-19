app.controller('resourceController', ['$scope', '$location', 'resource', function($scope, $location, resource){

    // 设置crumb 和 page-header
    $scope.type='resource'
    $scope.crumbOne = '资源管理'
    $scope.curmbOneLink= '#/resource'
    $scope.crumbTwo = '基础资源'
    $scope.headerSpan = '基础资源'
    $scope.headerDetail = '显示各个节点资源使用概况'

    $scope.getInfo = function(){
        function callBack(data){
            $scope.info = data.node_array;
        }
        resource.getInfo(callBack);
    };
    $scope.getInfo();

}]);
