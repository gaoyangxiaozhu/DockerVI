// container list page controller

app.controller('containerController', ['$scope', '$location', 'container', function($scope, $location, container){
    var containers = [];
    // 设置crumb 和 page-header
    $scope.type='containers';
    $scope.crumbOne = '视频服务管理'
    $scope.curmbOneLink="#/container/list"
    $scope.crumbTwo = '视频服务列表'
    $scope.headerSpan = '视频服务列表'
    $scope.headerDetail = '以列表形式显示视频'

    //getSubList
    $scope.getSubList= function(page){
        var start= (page-1)*$scope.pageSize;
        var end = start+$scope.pageSize;
        $scope.containers = container.getSubList(start, end);

        // 如果当前为空页 就返回到上一页显示
        if($scope.containers.length==0){
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
    }

    // container list获取成功后在回调函数中执行containre_list_init函数初始化scope.containers
    // 默认containers只获得前10个数据
    var container_list_init=function(data){
        // 获取容器列表
        $scope.currentPage=1;
        $scope.pageSize =15;
        $scope.total = data.length;
        $scope.getSubList(1);
    }
    container.data(null, container_list_init);


    // 运行容器
    $scope.startContainer= function(currentContainer){

        // 成功启动容器后执行的回调函数

        var after_start_container= function(data){
            currentContainer.Status = 'running';
        }
        container.start(currentContainer.Id, after_start_container);
    }

    // 停止容器
    $scope.stopContainer= function(currentContainer){

        // 成功关闭容器后执行的回调函数
        var after_stop_container = function(data){
            currentContainer.Status = 'stop';
        }

        container.stop(currentContainer.Id, after_stop_container);
    }
    // 删除容器
    $scope.delContainer= function(currentContainer){
        // 删除成功则更新当前的containers
        function updateContainers(){
            $scope.getSubList($scope.currentPage);
        }
        container.remove(currentContainer.Id.slice(0,12), updateContainers);
    }
}]);

// container details page controller
app.controller('containerDetailController', ['$scope', '$routeParams', 'container', function($scope, $routeParams, container){
    var ID = $routeParams.ID;
    var current_detail_init = function(data){
        $scope.container = data;
    }
    container.data(ID, current_detail_init);

    $scope.getLog = function(){
        container.getLog(ID)
        .success(function(data, status, header){
            $scope.container.log = data ? data: 'no logs';
        })
        .error(function(data, status, header){
                console.log(status);
        });
    }

    // 运行容器
    $scope.startContainer= function(currentContainer){

        // 成功启动容器后执行的回调函数
        var after_start_container= function(data){

            // 重新启动后刷新所有数据 重新渲染表格
            container.data(ID, current_detail_init);
        }
        container.start(currentContainer.Id, after_start_container);
    }

    // 停止容器
    $scope.stopContainer= function(currentContainer){

        // 成功关闭容器后执行的回调函数
        var after_stop_container = function(data){

            // 关闭容器后刷新所有数据 重新渲染表格
            container.data(ID, current_detail_init);
        }
        container.stop(currentContainer.Id, after_stop_container);
    }
    //资源stream
    $scope.getResourceStats = function(){
        container.getResourceStats(ID)
        .success(function(data, status, header){
            console.log(data);
        })
        .error(function(data, status, header){
                console.log(status);
                alert(data);
        });
    }
}]);
