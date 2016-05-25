// image list page controller
(function(){
    angular.module("dockerApp.volume")
    .controller('volumeCtrl', ['$scope', '$location', 'Volume', '$state', function($scope, $location, Volume, $state){

        $scope.options = {
            currentPage: 1,
            itemPerPage : 10,
            isRest: false
        };
        $scope.volumes = {};
        $scope.search = {};
        $scope.search.volume = {};
        $scope.loading = {};


        Volume.getVolumesList().then(function(results){
            if(results.volumes && results.volumes.length > 0){
                $scope.volumes.results = results.volumes;
                $scope.volumes.count = results.total;
                $scope.volumes.pagesNum = Math.ceil(results.total / $scope.options.itemPerPage);//向上取整

            }
        });

        $scope.viewDetail = function(volume){
            //无论结果怎样　先打开显示面板
            volume.showDetail = true;
            if(volume.detail){
                //如果之前已经获取过当前数据卷的详细情况　直接返回
                return;
            }
            volume.loading = true;
            var option={
                id: volume.fullName,
                node: volume.node
            };
            Volume.getVolumesDetail(option).then(function(result){
                if(result.error_msg){
                    //TODO 出错
                }else{
                    volume.detail = result;
                    volume.loading = false;
                }
            });
        };
        $scope.createVolume = function(){
            $state.go('volumeCreate');
        };


        function doPaging(option){
            //返回$promise对象
            return Volume.getVolumesList(option).then(function(results){
                        //当前search相关的dockhub镜像总数
                        $scope.volumes.count = results.total;
                        $scope.volumes.pagesNum = Math.ceil(results.total / $scope.options.itemPerPage);//向上取整
                        if(!$scope.volumes || $scope.volumes.length === 0){
                            $scope.volumes.results = results.volumes;

                        }else{
                            if($scope.options.isRest){
                                $scope.volumes.results = results.volumes;
                            }else{
                                $scope.volumes.results = $scope.volumes.results.concat(results.volumes);
                            }
                        }
                    });
        }
        $scope.loadMoreVolume = function(){
            if($scope.loading.volumesMore){
                return ;
            }
            $scope.loading.volumesMore = true;
            var option = {
                name : $scope.search.volume.name,
                node : $scope.search.volume.node,
                itemsPerPage : $scope.options.itemPerPageForDockerhub,
                currentPage : $scope.options.currentPageForDockerhub + 1
            };
            doPaging(option).then(function(){
                $scope.options.currentPage++;
                $scope.loading.volumesMore = false;
            });
        };

    }])
    .controller('volumeCreateCtrl', ['$scope', '$location', 'Image', '$state', function($scope, $location, Image, $state){


    }]);
})();
