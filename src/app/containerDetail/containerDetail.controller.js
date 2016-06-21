(function(){
    angular.module("dockerApp.containers")
    .controller('containerDetailCtrl', ['$rootScope', '$scope', 'Container', '$state', '$stateParams', 'toaster', 'SweetAlert',  function($rootScope, $scope, Container, $state, $stateParams, toaster, SweetAlert){

        //其实是name
        var containerId = $state.params.id;
        console.log(containerId);

        //如果当前有新的容器生成　给出提示框
        if($state.params.new){

            $scope.isFirst = true; //显示日志tab
            if($rootScope.load.loaded){
                toaster.pop('success', "", "容器创建成功!");

            }
        }

        $scope.logInit = false;//默认补获取日志



        $scope.stopContainer = function(){
            Container.updateContainer({ _id: containerId, action : 'stop'}).then(function(result){
                if(result && 'msg' in result && result.msg === 'ok'){
                    $scope.container.status = 'stop';
                }
            });
        };
        $scope.startContainer = function(){
            Container.updateContainer({ _id: containerId, action : 'start'}).then(function(result){
                //TODO err的处理
                if(result && 'msg' in result && result.msg === 'ok'){
                    $scope.container.status = 'running';
                }
            });
        };
        Container.getContainer({id: containerId}).then(function(result){
            if('error_msg' in result && result.error_msg && result.status == 404){
                $state.go('containerList');
                return;
            }
            $scope.container = result.container;
            //如果容器是新创建的　就启动容器　动态更新日志
            if($state.params.new){
                if($scope.container.status != 'running') {
                    $scope.startContainer();
                }
            }
        });

        $scope.delete = function(){
            SweetAlert.swal({
                title: "你确定?",
                text: "你将删除选中的" + $scope.container.name + '容器!',
                type: "warning",
                showCancelButton: true,
                cancelButtonText: "取消",
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "是的, 我要删除!",
                closeOnConfirm: false,
                showLoaderOnConfirm: true },
                function(isConfirm){
                    if(isConfirm){
                        Container.deleteContainer({data: [$scope.container.name ]}).then(function(result){
                            if(result && 'msg' in result && result.msg === 'ok'){
                                window.swal.close(); //关闭SweetAlert
                                $state.go('containerList', {
                                    removeContainer : true
                                });
                            }
                        });

                    }

                });
        };

        $scope.getMetrics = function(option){
            switch (option) {
                case 'day':
                    //当点击24小时时，显示loading效果
                    $scope.dayLoading = true;
                    Container.getContainerStats({id : containerId, node: $scope.container.node }).then(function(resluts){
                        $scope.dayResources = resluts;
                    });
                    break;

            }
        };
    }]);
})();
