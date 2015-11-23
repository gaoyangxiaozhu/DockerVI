// container list page controller

app.controller('containerController', ['$scope', '$location', 'container', function($scope, $location, container){
    var containers = [];
    // 设置crumb 和 page-header
    $scope.type='containers';
    $scope.crumbOne = '容器管理'
    $scope.crumbTwo = '容器列表'
    $scope.headerSpan = '容器列表'
    $scope.headerDetail = '以列表形式显示容器列表内容'


    // container list获取成功后在回调函数中执行containre_list_init函数初始化scope.containers
    var container_list_init=function(data){
        // 获取容器列表
        $scope.currentPage=1;
        $scope.pageSize =10;
        $scope.total = data.length;
        $scope.containers = container.getSubList(0, $scope.pageSize);
    }
    container.data('', container_list_init);

    //getSubList
    $scope.getSubList= function(page){
        var start= (page-1)*$scope.pageSize;
        var end = start+$scope.pageSize;
        console.log(start+" "+end);
        $scope.containers = container.getSubList(start, end);

        //scroll to top
        function scrollTop(){
            $("html, body").animate({scrollTop: $("html, body").offset().top}, "fast")
        }
        t=setTimeout(scrollTop, 0);
    }

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
    $scope.delContainer= function(id){
        // TODO 目前做法是删除一个container以后 在remove function纸箱成功的回调函数中更新containers 从而更新前端container列表

        function get_new_containers(){
            container.data('', container_list_init);
        }
        container.remove(id, get_new_containers);
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
            console.log(data);
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


}]);
