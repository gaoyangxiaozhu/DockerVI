(function(){
    angular.module("dockerApp")
    .controller('containerDetailCtrl', ['$scope', '$routeParams', 'container', function($scope, $routeParams, container){

        //TODO
        //通过container.init()对容器列表进行初始化工作　
        //主要是获取容器列表并赋值给全局变量_containers

        container.init();

        //遍历容器列表　如果当前容器是开启状态就分配资源收集模块　收集资源数据
        //这里面也调用了resourceCollectForCurrentRunningContainers函数　主要是在用户直接进入此页面以后也可以开启对各个资源的收集

        container.resourceCollectForCurrentRunningContainers();
        // ID其实是容器的name

        var ID = $routeParams.ID;
        var current_detail_init = function(data){
            $scope.container = data;
        };
        container.data(ID, current_detail_init);


        $scope.getLog = function(){
            container.getLog(ID)
            .success(function(data, status, header){
                data = data.data;
                $scope.container.log = data ? data: 'no logs';
            })
            .error(function(data, status, header){
                    console.log(status);
            });
        };

        // 运行容器
        $scope.startContainer= function(currentContainer){
            // 成功启动容器后执行的回调函数
            var after_start_container= function(data){

                // 重新启动后刷新所有数据 重新渲染表格
                container.data(ID, current_detail_init);
            };
            container.start(currentContainer.Id, currentContainer['node_name'][0], after_start_container);
        };

        // 停止容器
        $scope.stopContainer= function(currentContainer){
            // 成功关闭容器后执行的回调函数
            var after_stop_container = function(data){

                // 关闭容器后刷新所有数据 重新渲染表格
                container.data(ID, current_detail_init);
            };
            container.stop(currentContainer.Id, after_stop_container);
        };
        //资源stream
        $scope.showGraphForResourceFlag = false;
        $scope.isLoading = false;
        $scope.noData = false;
        $scope.getResourceStats = function(){
            $scope.showGraphForResourceFlag = true;
            function invokeContainerGetResourceFunction(){
                container.getResourceStats(ID)
                .success(function(data, status, header){
                    $scope.graphData = data;
                    if($scope.graphData.data.length === 0){
                        $scope.isLoading = true;
                        $scope.noData = true;
                    }else{
                        $scope.noData = false;
                    }
                })
                .error(function(data, status, header){
                    console.log('error');
                        clearTimeout(t);
                });
                console.log($scope.showGraphForResourceFlag);
                if($scope.showGraphForResourceFlag){
                    t=setTimeout(invokeContainerGetResourceFunction,4500); //每4秒渲染一次
                }else{
                    clearTimeout(t);
                }
            }
            $scope.isLoading = true;
            invokeContainerGetResourceFunction();
        };
    }]);
})();
