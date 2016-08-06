// image list page controller
(function(){
    angular.module("dockerApp.imageList")
    .controller('imageListCtrl', ['$rootScope', '$scope', '$location', 'Image', '$state', 'toaster', 'SweetAlert', function($rootScope, $scope, $location, Image, $state, toaster, SweetAlert){

        $scope.imagePackages = {};

        $scope.dockerhubPackages = {};
        $scope.search = {};
        $scope.search.dockerhub = {};
        $scope.search.dockerhub.content = null;

        $scope.loading = {};

        //前两个参数设置获取本地已有镜像的每页参数　后两个为dockerHub每页对应参数
        $scope.options = {
            currentPage: 1,
            itemPerPage : 10,
            isRest: false,
            currentPageForDockerhub: 1,
            itemPerPageForDockerhub: 10,
            isRestForDockerhub: false
        };

        //私有变量　当用户输入search　content以后　将副本存入其中　当用户点击加载更多的时候　$scope.search.dockerhub.content的内容可能会改变
        //但由于用户没有点击搜索　或者点击enter键　因此其实用户实际并没有更新content 此时我们以此副本的内容作为搜索项
        var _search = {};
        _search.dockerhub = {};

        //isInit 表示是否是初始化调用doPaing函数　还是翻页调用
        function doPaging(options, isInit){
            $scope.imagePackages.isLoading = true;
             //数量需要过滤
            return Image.getImagesCount().then(function(result){
                if(result && result.msg === 'ok'){
                    $scope.imagePackages.count = result.count;
                    $scope.imagePackages.numPages = Math.ceil($scope.imagePackages.count/$scope.options.itemPerPage);

                    //获取列表
                    return Image.getImagesList(options).then(function(data){
                        $scope.imagePackages.isLoading = false;
                        if(data && data.msg === 'ok'){
                            //如果是初始化列表
                            if(isInit){
                                $scope.imagePackages.results = data.results;
                                return;
                            }
                            //否则为翻页
                            if($scope.imagePackages.results){
                                if(!$scope.options.isRest){
                                    $scope.imagePackages.results = $scope.imagePackages.results.concat(data.results);
                                }else{
                                    $scope.imagePackages.results = data.results;
                                }
                            }else{
                                $scope.imagePackages.results = data.results;
                            }
                            //如果是翻页导致　则更新currentPage
                            $scope.options.currentPage ++;

                        }else{
                            toaster.pop('error', "", "获取镜像列表出错!");
                        }

                    }).catch(function(){
                       $scope.imagePackages.isLoading = false;
                       $scope.imagePackages.results = [];
                    });
                }else{
                    toaster.pop('error', "", "获取镜像总数出错!");
                }
            });
        }
        //初始化列表
        doPaging($scope.options, true);

        //加载更多
       $scope.loadMore = function(){
           var options = {
               itemsPerPage :  $scope.options.itemPerPage,
               currentPage :  $scope.options.currentPage + 1
           };
           doPaging(options);
       };

        // 删除镜像
        $scope.delImage = function(currentImage){

            SweetAlert.swal({
                title: "你确定删除当前镜像?",
                text: 'id:' + currentImage.id,
                type: "warning",
                showCancelButton: true,
                cancelButtonText: "取消",
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "是的, 我要删除!",
                closeOnConfirm: false,
                showLoaderOnConfirm: true },
                function(isConfirm){
                    if(isConfirm){
                        // 如果删除成功， 更新当前images
                        Image.deleteImage({ id: currentImage.fullId }).then(function(result){
                            if(result && 'msg' in result && result.msg === 'ok'){
                                window.swal.close(); //关闭SweetAlert
                                $rootScope.progressbar.setColor('green');
                                $rootScope.progressbar.reset(); // Required to handle all edge cases.
                                $rootScope.progressbar.start();
                                toaster.pop('success', "", "删除成功!");

                                $scope.options.currentPage = 1;
                                //重新获取镜像列表
                                doPaging($scope.options, true).then(function(){
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

        $scope.createContainerInstance = function(image, remote){

            if(typeof image === 'string' && remote){//说明是远程dockerhub镜像

                $state.go(
                    'containerCreate',{
                        id: image,
                        source: 'remote'
                    });
                return;
            }
            //否则为本地镜像
            if(Object.prototype.toString.call(image) === '[object Object]'){

                $state.go(
                    'containerCreate',{
                        id: image.id || image.name
                    });
            }

        };
        //私有函数
        function _searchDocker(){
            var data = {
                content : _search.dockerhub.content,
                itemsPerPage : $scope.options.itemPerPageForDockerhub,
                currentPage : $scope.options.currentPageForDockerhub
            };
            doPagingForDockerhub(data).then(function(){
                $scope.loading.dockerhub = false;
            });

        }
        function doPagingForDockerhub(option){
            //返回$promise对象
            return Image.searchDockerImage(option).then(function(results){
                    if(results.msg === 'ok'){
                        $scope.showNeedNetworkMsg = false;
                        //当前search相关的dockhub镜像总数
                        $scope.dockerhubPackages.count = results.total;
                        $scope.dockerhubPackages.pagesNum = Math.ceil(results.total / $scope.options.itemPerPageForDockerhub);//向上取整
                        if(!$scope.dockerhubPackages.results || $scope.dockerhubPackages.results.length === 0){
                            $scope.dockerhubPackages.results = results.dockerhubPAckagesList;

                        }else{
                            if($scope.options.isRestForDockerhub){
                                $scope.dockerhubPackages.results = results.dockerhubPAckagesList;
                            }else{
                                $scope.dockerhubPackages.results = $scope.dockerhubPackages.results.concat(results.dockerhubPAckagesList);
                            }
                        }
                    }else{
                        //可能没有联网哦
                        $scope.showNeedNetworkMsg = true;
                    }

                    });
        }
        $scope.loadMoreDockerhub = function(){
            if($scope.loading.dockerhubMore) {
                return ;
            }
            $scope.loading.dockerhubMore = true;
            var option = {
                content : _search.dockerhub.content,
                itemsPerPage : $scope.options.itemPerPageForDockerhub,
                currentPage : $scope.options.currentPageForDockerhub + 1
            };
            doPagingForDockerhub(option).then(function(){
                $scope.options.currentPageForDockerhub++;
                $scope.loading.dockerhubMore = false;
            });
        };
        $scope.searchDockerHub =function(){
            $scope.dockerhubPackages = {};
            $scope.options.currentPageForDockerhub = 1;
            if($scope.search.dockerhub.content && $scope.search.dockerhub.content.trim() !== ""){
                _search.dockerhub.content =  $scope.search.dockerhub.content;
                $scope.loading.dockerhub = true;
                _searchDocker();
            }
        };
        $scope.keypressEvent = function($event){
            //每次重新检索镜像　dockerhubPackages重置为空
            $scope.dockerhubPackages = {};
            $scope.options.currentPageForDockerhub = 1;
            if($event.keyCode === 13){
                if($scope.search.dockerhub.content && $scope.search.dockerhub.content.trim() !== ""){
                    _search.dockerhub.content =  $scope.search.dockerhub.content;
                    $scope.loading.dockerhub = true;
                    _searchDocker();
                }
            }
        };

    }]);
})();
