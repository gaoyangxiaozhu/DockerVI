app.controller('imageListController', ['$scope', '$location', 'image', function($scope, $location, image){

    // 设置crumb 和 page-header
    $scope.type='images'
    $scope.crumbOne = '镜像管理'
    $scope.curmbOneLink= '#/image/list'
    $scope.crumbTwo = '镜像列表'
    $scope.headerSpan = '镜像列表'
    $scope.headerDetail = '以列表形式显示镜像列表内容'

    var image_list_init = function(data){
        $scope.currentPage=1;
        $scope.pageSize =10;
        $scope.total = data.length;

        // 获得列表数据 当前显示第一页
        $scope.images = image.getSubList(0, $scope.pageSize);
    }
    image.data(null, image_list_init);//初始化images列表 默认只取得pageSize大小的image元素用于显示第一页

    //getSubList
    // TODO 应该可以和container控制器中的函数通过$rootScope进行统一？
    $scope.getSubList= function(page){
        var start= (page-1)*$scope.pageSize;
        var end = start+$scope.pageSize;
        $scope.images = image.getSubList(start, end);

        //scroll to top
        function scrollTop(){
            $("html, body").animate({scrollTop: $("html, body").offset().top}, "fast")
        }
        t=setTimeout(scrollTop, 0);
    }

    $scope.createContainerInstance = function(imageName, imageTag){
        url = "/#/container/create/?imageName="+imageName+"&imageTag="+imageTag;
        window.location= url;
    };
    // 删除容器
    $scope.delImage= function(currentImage){
        // 如果删除成功， 从镜像列表数组删除当前image
        // TODO 这个数组可以通过Array.prorototype.removeitem 定义实现重用
        function removeItemFromArray(){
            var index = $scope.images.indexOf(currentImage);
            if(index>-1){
                $scope.images.splice(index, 1);
            }
        }
        image.remove(currentImage.name, removeItemFromArray);
    }

}])
