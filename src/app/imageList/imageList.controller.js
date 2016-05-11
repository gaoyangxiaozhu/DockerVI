// container list page controller
(function(){
    angular.module("dockerApp")
    .controller('imageListCtrl', ['$scope', '$location', 'image', function($scope, $location, image){
        //getSubList
        $scope.getSubList= function(page){
            var start= (page-1)*$scope.pageSize;
            var end = start+$scope.pageSize;
            $scope.images = image.getSubList(start, end);

            // 如果当前为空页 就返回到上一页显示
            if($scope.images.length === 0){
                if(page==1) return;
                $scope.currentPage=page-1;
                $scope.total = image.getLength();
                $scope.getSubList($scope.currentPage);
            }


            //scroll to top
            function scrollTop(){
                $("html, body").animate({scrollTop: $("html, body").offset().top}, "fast")
            }
            t=setTimeout(scrollTop, 0);
        };

        var image_list_init = function(data){
            $scope.currentPage=1;
            $scope.pageSize =10;
            $scope.total = data.length;

            // 获得列表数据 当前显示第一页
            $scope.getSubList(1);
        };
        image.data(null, image_list_init);//初始化images列表 默认只取得pageSize大小的image元素用于显示第一页



        $scope.createContainerInstance = function(image){
            repoName = image.repo;
            username = image.username;
            imageName = image.name;
            imageTag = image.tag;
            var re = /^\d+\.\d+\.\d+\.\d+:\d{4}$/;
            if(re.test(repoName)){
                url = "/#/container/create/?imageRepo="+repoName+"&username="+username+"&imageName="+imageName+"&imageTag="+imageTag;
            }else{
                if(username=='docker'){
                    url = "/#/container/create/?imageName="+imageName+"&imageTag="+imageTag;
                }else{
                    url = "/#/container/create/?username="+username+"&imageName="+imageName+"&imageTag="+imageTag;
                }
            }
            url=url+"&fullSourceName="+image.full_source_name;
            window.location= url;
        };
        // 删除容器
        $scope.delImage= function(currentImage){
            // 如果删除成功， 更新当前images
            function updateImages(){
                $scope.getSubList($scope.currentPage);
            }
            image.remove(currentImage.name, updateImages);
        }

    }])
})();
