// container list page controller
(function(){
    angular.module("dockerApp.containers")
    .controller('ContainerListCtrl', ['$rootScope', '$scope', '$location', 'Container', 'SweetAlert', '$state', 'toaster', function($rootScope, $scope, $location, Container, SweetAlert, $state, toaster){

        //现在默认创建成功跳转到detail页面了..
        //如果当前有新的容器生成　给出提示框
        if($state.params.newContainer){
            $scope.newContainer ={};
            $scope.newContainer.name = $state.params.newContainer;
            if($rootScope.load.loaded){
                toaster.pop('success', "", "容器创建成功!");
            }
        }
        //如果容器删除成功
        if($state.params.removeContainer){
            if($rootScope.load.loaded){
                toaster.pop('success', "", "容器删除成功!");
            }
        }

        $scope.containerList = [];
        $scope.waitForDeleteContainerIDList = [];

        $scope.options = {
            currentPage: 1,
            itemsPerPage : 10
        };

        function doPaging(options){
            $scope.isLoading = true;
             //数量需要过滤
             Container.getContainerCount(options).then(function(result){

                $scope.containerCount = result.count;
                $scope.numPages = Math.ceil($scope.containerCount / $scope.options.itemsPerPage);

             });
            //获取列表
            Container.getContainerList(options).then(function(result){
                $scope.isLoading = false;
                $scope.containerList = result;
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


        //点击delete按钮　删除选中的容器应用
        $scope.deleteCheckedApp = function(){
            SweetAlert.swal({
                title: "你确定?",
                text: "你将删除选中的" + $scope.waitForDeleteContainerIDList.length + '个容器!',
                type: "warning",
                showCancelButton: true,
                cancelButtonText: "取消",
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "是的, 我要删除!",
                closeOnConfirm: false,
                showLoaderOnConfirm: true },
                function(isConfirm){
                    if(isConfirm){
                        var deleteContainerNameList = [];
                        $scope.containerList.forEach(function(item, index){
                            if(item.check){
                                deleteContainerNameList.push(item.name);
                            }
                        });

                        if(deleteContainerNameList.length > 0){
                            Container.deleteContainer({data: deleteContainerNameList}).then(function(result){
                                if(result && 'msg' in result && result.msg === 'ok'){
                                    window.swal.close(); //关闭SweetAlert
                                    $scope.checkedItem = false;
                                    //获取列表
                                    $scope.options = {
                                        currentPage: 1,
                                        itemsPerPage : 10
                                    };
                                    $rootScope.progressbar.setColor('green');
                                    $rootScope.progressbar.reset(); // Required to handle all edge cases.
                                    $rootScope.progressbar.start();
                                    Container.getContainerList($scope.options).then(function(result){

                                        $scope.containerList = result;
                                        toaster.pop('success', "", "删除成功!");
                                        $rootScope.progressbar.complete();
                                    }).catch(function(){
                                        $scope.containerList = $scope.containerList ||  [];
                                        toaster.pop('success', "", "删除成功!");
                                        $rootScope.progressbar.complete();


                                    });
                                }
                            });
                        }
                    }

                });
        };
        $scope.checkItem = function(container){
            if(container.check){
                if($scope.waitForDeleteContainerIDList.indexOf(container.Id) < 0){
                    $scope.waitForDeleteContainerIDList.push(container.Id);
                }
                if(!$scope.checkedItem){
                    $scope.checkedItem = true;
                }
            }else{
                if($scope.waitForDeleteContainerIDList.indexOf(container.Id) >= 0){
                    var index =  $scope.waitForDeleteContainerIDList.indexOf(container.Id);
                    $scope.waitForDeleteContainerIDList.splice(index, 1); //从待删除的列表中移除取消删除的项
                    if($scope.waitForDeleteContainerIDList.length === 0){
                        if($scope.checkedItem){
                            $scope.checkedItem = false;
                        }
                    }
                }

            }
        };
    }]);
})();
