// image list page controller
(function(){
    angular.module("dockerApp.volume")
    .controller('volumeCtrl', ['$rootScope', '$scope', '$location', 'Volume', '$state', 'SweetAlert', 'ngProgressFactory', 'toaster',  function($rootScope, $scope, $location, Volume, $state, SweetAlert, ngProgressFactory, toaster){

        //默认第二个Tab显示
        $scope.isFirst = true;

        //如果当前有新的数据卷生成　给出提示框
        if($state.params.newVolume){
            if($rootScope.load.loaded){
                toaster.pop('success', "", "数据卷创建成功!");
            }
        }

        $scope.options = {
            currentPage: 1,
            itemPerPage : 10,
            isRest: true
        };

        $scope.volumes = {};
        $scope.search = {};
        $scope.search.volume = {};
        $scope.loading = {};


        //私有变量　保存要查询的volume的name和node值
        var _name;
        var _node;

        function init(results){
            //volume相关数据的初始化
            if(results.volumes && results.volumes.length > 0){
                $scope.volumes.count = results.total;
                $scope.volumes.pagesNum = Math.ceil(results.total / $scope.options.itemPerPage);//向上取整
                if(!$scope.volumes || $scope.volumes.length === 0){
                    $scope.volumes.results = results.volumes;

                }else{
                    if($scope.options.isRest){
                        $scope.volumes.results = results.volumes;
                        $scope.options.isRest = false;
                    }else{
                        $scope.volumes.results = $scope.volumes.results.concat(results.volumes);
                    }
                }
            }
        }

        Volume.getVolumesList().then(function(results){

            init(results);
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

        $scope.removeVolume = function(volume){
            var name = volume.fullName;
            var node = volume.node;
            SweetAlert.swal({
                title: "你确定?",
                text: "你将删除位于" + node + '节点的' + volume.name + '数据卷',
                type: "warning",
                showCancelButton: true,
                cancelButtonText: "取消",
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "是的, 我要删除!",
                closeOnConfirm: false,
                showLoaderOnConfirm: true },
                function(isConfirm){
                    if(isConfirm){
                        Volume.deleteVolume({id: name, node: node}).then(function(result){
                            if(result.msg === "ok"){
                                $scope.search.volume = {}; //清空搜索框
                                window.swal.close(); //关闭SweetAlert
                                $rootScope.progressbar.setColor('green');
                                $rootScope.progressbar.reset(); // Required to handle all edge cases.
                                $rootScope.progressbar.start();
                                Volume.getVolumesList().then(function(results){
                                    $scope.options.isRest = true;
                                    init(results);
                                    toaster.pop('success', "", "数据卷删除成功!");
                                    $rootScope.progressbar.complete();
                                });
                            }else{
                                SweetAlert.swal({
                                    title: result.status + ' Error',
                                    text: result.error_msg,
                                    type: "warning",
                                    confirmButtonColor: "#DD6B55",
                                    confirmButtonText: "确定",
                                    closeOnConfirm: true },
                                    function(){
                                          $state.reload();
                                    }
                                );
                            }
                        });
                    }

                });
        };

        function doPaging(option){
            //返回$promise对象
            return Volume.getVolumesList(option).then(function(results){
                        init(results);
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
                itemsPerPage : $scope.options.itemPerPage,
                currentPage : $scope.options.currentPage + 1
            };
            doPaging(option).then(function(){
                $scope.options.currentPage++;
                $scope.loading.volumesMore = false;
            });
        };

     $scope.searchVolume = function(){
         var currentSNa = $scope.search.volume.name ? $scope.search.volume.name.trim() : undefined;
         var currentSNo = $scope.search.volume.node ? $scope.search.volume.node.trim() : undefined;
         if( currentSNa != _name || currentSNo != _node){
             //只要有一个和之前的不同就重新检索
             _name = currentSNa;
             _node = currentSNo;
             $scope.search.volume.loading = true;
             $scope.options.currentPage = 1;

             var option = {
                 itemsPerPage : $scope.options.itemPerPage,
                 currentPage : $scope.options.currentPage,
                 name: _name,
                 node: _node
             };
             Volume.searchVolume(option).then(function(results){
                $scope.search.volume.loading = false;
                $scope.options.isRest = true;
                init(results);
             });
         }
     };

    }])
    .controller('volumeCreateCtrl', ['$scope', '$location', 'Volume', '$state','SweetAlert', function($scope, $location, Volume, $state , SweetAlert){

        $scope.volume = {};
        $scope.available = {};

        $scope.checkVolumeName = function(){
            var name = $scope.volume.name ? $scope.volume.name.trim() : "";
            if(name){
                if(name[0] === '_' || name[0] === '-'){
                    $scope.available.name = false;
                    switch (name[0]) {
                        case '-':
                            $scope.available.nameErrorMsg="数据卷名称不能以-开头";
                            break;
                        default:
                            $scope.available.nameErrorMsg="数据卷名称不能以_开头";
                    }
                }else{
                    if(!(/^[a-zA-Z0-9-_]*$/.test(name))){
                        $scope.available.name = false;
                        $scope.available.nameErrorMsg="数据卷名称只能包含英文字母，数字以及中划线 -以及下划线";
                    }else{
                        $scope.available.name = true;
                    }
                }
            }else{
                $scope.available.name = false;
                $scope.available.nameErrorMsg="数据卷名称不能为空";
            }
        };

        $scope.createVolume = function(){

            $scope.waitForCreated = true;
            console.log($scope.volume.name);

            Volume.createNewVolume({ id : $scope.volume.name }).then(function(result){
                console.log(result);

               $scope.waitForCreated = false;
               if(result.msg && result.msg == 'ok'){
                   //如果创建成功就启动容器并在返回容器列表页面
                   $state.go(
                       'volume',{
                          newVolume : $scope.volume.name
                      }
                  );
              }else{//显示错误信息
                  SweetAlert.swal({
                      title: result.status + ' Error',
                      text: result.error_msg,
                      type: "warning",
                      confirmButtonColor: "#DD6B55",
                      confirmButtonText: "确定",
                      closeOnConfirm: true },
                      function(){
                            $state.reload();
                      }
                  );
              }
          });
      };

    }]);
})();
