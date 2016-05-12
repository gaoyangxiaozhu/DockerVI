// container list page controller
(function(){
    angular.module("dockerApp")
    .controller('imageListCtrl', ['$scope', '$location', 'image', function($scope, $location, image){

        $scope.imageList = [];

        $scope.option = {
            currentPage: 1,
            itemPerPage : 10
        };

        function doPaging(options){
            $scope.isLoading = true;
             //数量需要过滤
             Blog.getImagesCount(options).then(function(result){
                $scope.containerCount = result.count;
                $scope.numPages = Math.ceil($scope.containerCount/$scope.options.itemsPerPage);
             });
            //获取列表
            Blog.getImagesList(options).then(function(result){
                $scope.isLoading = false;
                $scope.imageList = result.data;
            }).catch(function(){
               $scope.isLoading = false;
               $scope.imageList = [];
            });
        }
        //初始化列表
        doPaging($scope.option);

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
            image.deleteImage({_id: currentImage.name }, updateImages);
        };

    }]);
})();
