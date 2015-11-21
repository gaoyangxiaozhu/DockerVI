app.controller('imageListController', ['$scope', '$location', 'image', function($scope, $location, image){

    // 设置crumb 和 page-header
    $scope.type='images'
    $scope.crumbOne = '镜像管理'
    $scope.crumbTwo = '镜像列表'
    $scope.headerSpan = '镜像列表'
    $scope.headerDetail = '以列表形式显示镜像列表内容'

    var image_list_init = function(data){
        // 获得列表数据
        $scope.images = data;
    }
    image.data(null, image_list_init);
    $scope.createContainerInstance = function(imageName, imageTag){
        url = "/#/container/create/?imageName="+imageName+"&imageTag="+imageTag;
        window.location= url;
    };
    // 删除容器
    $scope.delImage= function(name){
        // TODO 目前做法是删除一个image以后 在remove function纸箱成功的回调函数中更新iamge列表

        function get_new_images(){
            image.data('', image_list_init);
        }
        image.remove(name, get_new_images);
    }

}])
