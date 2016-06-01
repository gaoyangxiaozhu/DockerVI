(function(){
    angular.module("dockerApp.containers")
    .controller('containerDetailCtrl', ['$scope', 'Container', '$state', '$stateParams', function($scope, Container, $state, $stateParams){

        //其实是name
        var containerId = $state.params.id;

        $scope.logInit = false;//默认补获取日志
        
        Container.getContainer({id: containerId}).then(function(result){
            $scope.container = result.container;
        });


        $scope.getMetrics = function(option){
            switch (option) {
                case 'day':
                    //当点击24小时时，显示loading效果
                    $scope.dayLoading = true;
                    Container.getContainerStats({id : containerId}).then(function(resluts){
                        $scope.dayResources = resluts;
                    });
                    break;

            }
        };
    }]);
})();
