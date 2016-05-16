// image list page controller
(function(){
    angular.module("dockerApp.imageList")
    .controller('imageListCtrl', ['$scope', '$location', 'Image', function($scope, $location, Image){

        $scope.imageList = [];

        $scope.options = {
            currentPage: 1,
            itemPerPage : 10
        };

        function doPaging(options){
            $scope.isLoading = true;
             //数量需要过滤
             Image.getImagesCount(options).then(function(result){
                $scope.containerCount = result.count;
                $scope.numPages = Math.ceil($scope.containerCount/$scope.options.itemPerPage);
             });
            //获取列表
            Image.getImagesList(options).then(function(result){
                $scope.isLoading = false;
                $scope.imageList = result;
            }).catch(function(){
               $scope.isLoading = false;
               $scope.imageList = [];
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

    }]);
})();
