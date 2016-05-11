// container list page controller
(function(){
    angular.module("dockerApp")
    .controller('ContainerListCtrl', ['$scope', '$location', 'container', function($scope, $location, container){
        var containers = [];

        //getSubList
        $scope.getSubList= function(page){
            var start= (page-1)*$scope.pageSize;
            var end = start+$scope.pageSize;
            $scope.containers = container.getSubList(start, end);

            // 如果当前为空页 就返回到上一页显示
            if($scope.containers.length===0){
                if(page==1) return;
                $scope.currentPage=page-1;
                $scope.total = container.getLength();
                $scope.getSubList($scope.currentPage);
            }

            //scroll to top
            function scrollTop(){
                $("html, body").animate({scrollTop: $("html, body").offset().top}, "fast")
            }
            t=setTimeout(scrollTop, 0);
        };
        //通过container.init()对容器列表进行初始化工作　
        //主要是获取容器列表并赋值给全局变量_containers

        container.init();

        //遍历容器列表　如果当前容器是开启状态就分配资源收集模块　收集资源数据

        container.resourceCollectForCurrentRunningContainers();

        // container list获取成功后在回调函数中执行containre_list_init函数初始化scope.containers
        // 默认containers只获得前10个数据
        var container_list_init=function(data){
            // 获取容器列表
            $scope.currentPage=1;
            $scope.pageSize =15;
            $scope.total = data.length;
            $scope.getSubList(1);


        };
        container.data(null, container_list_init);


        // 运行容器
        $scope.startContainer= function(currentContainer){

            // 成功启动容器后执行的回调函数

            var after_start_container= function(data){
                currentContainer.Status = 'running';
            };
            container.start(currentContainer.Id, currentContainer['node_name'][1], after_start_container);
        };

        // 停止容器
        $scope.stopContainer= function(currentContainer){
            // 成功关闭容器后执行的回调函数
            var after_stop_container = function(data){
                currentContainer.Status = 'stop';
            };
            container.stop(currentContainer.Id, after_stop_container);
        };
        // 删除容器
        $scope.delContainer= function(currentContainer){
            // 删除成功则更新当前的containers
            function updateContainers(){
                $scope.getSubList($scope.currentPage);
            }
            console.log(currentContainer.Id);
            container.remove(currentContainer.Id.slice(0,12), updateContainers);
        };
    }]);
})();
