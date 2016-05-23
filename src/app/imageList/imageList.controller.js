// image list page controller
(function(){
    angular.module("dockerApp.imageList")
    .controller('imageListCtrl', ['$scope', '$location', 'Image', '$state', function($scope, $location, Image, $state){

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
            currentPageForDockerhub: 1,
            itemPerPageForDockerhub: 10,
            isRestForDockerhub: false
        };

        //私有变量　当用户输入search　content以后　将副本存入其中　当用户点击加载更多的时候　$scope.search.dockerhub.content的内容可能会改变
        //但由于用户没有点击搜索　或者点击enter键　因此其实用户实际并没有更新content 此时我们以此副本的内容作为搜索项
        var _search = {};
        _search.dockerhub = {};

        function doPaging(options){
            $scope.isLoading = true;
             //数量需要过滤
             Image.getImagesCount(options).then(function(result){
                $scope.imagePackages.count = result.count;
                $scope.imagePackages.numPages = Math.ceil($scope.imagePackages.count/$scope.options.itemPerPage);
             });
            //获取列表
            Image.getImagesList(options).then(function(results){
                $scope.isLoading = false;
                $scope.imagePackages.results = results;
            }).catch(function(){
               $scope.isLoading = false;
               $scope.imagePackages.results = [];
            });
        }
        //初始化列表
        doPaging($scope.options);

        //加载更多
       $scope.loadMore = function(page){
           $scope.options.currentPage = page;
           doPaging($scope.options, true);
       };

        // 删除镜像
        $scope.delImage= function(currentImage){
            // 如果删除成功， 更新当前images
            function updateImages(){
            doPaging($scope.currentPage);
            }
            Image.deleteImage({_id: currentImage.name }, updateImages);
        };

        $scope.createContainerInstance = function(image){
            $state.go(
                'containerCreate',{
                    id: image.id || image.name
                });
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
