// container list page controller
(function(){
    angular.module("dockerApp.containers")
    .controller('ContainerListCtrl', ['$scope', '$location', 'Container', function($scope, $location, Container){
        $scope.containerList = [];

        $scope.option = {
            currentPage: 1,
            itemPerPage : 10
        };

        function doPaging(options){
            $scope.isLoading = true;
             //数量需要过滤
             Container.getContainerCount(options).then(function(result){

                $scope.containerCount = result.count;
                $scope.numPages = Math.ceil($scope.containerCount / $scope.options.itemPerPage);
             });
            //获取列表
            Container.getContainerList(options).then(function(result){
                $scope.isLoading = false;
                $scope.containerList = result;
                console.log(result);
            }).catch(function(){
               $scope.isLoading = false;
                $scope.containerList = [];
            });
        }
        //初始化列表
        doPaging($scope.option);

        //加载更多
       $scope.loadMore = function(page){
           $scope.options.currentPage = page;
           doPaging($scope.options, true);
       };

        // 删除容器
        $scope.delContainer= function(currentContainer){
            // 删除成功则更新当前的containers
            function updateContainers(){
                doPaging($scope.currentPage);
            }
            Container.deleteContainer({_id : currentContainer.id }, updateContainers);
        };
    }]);
})();
