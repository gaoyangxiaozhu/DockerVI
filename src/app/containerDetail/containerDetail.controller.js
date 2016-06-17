(function(){
    angular.module("dockerApp.containers")
    .controller('containerDetailCtrl', ['$scope', 'Container', '$state', '$stateParams', function($scope, Container, $state, $stateParams){

        //其实是name
        var containerId = $state.params.id;

        $scope.logInit = false;//默认补获取日志

        Container.getContainer({id: containerId}).then(function(result){
            if('error_msg' in result && result.error_msg && result.status == 404){
                $state.go('containerList');
                return;
            }
            $scope.container = result.container;
        });

        $scope.stopContainer = function(){
            Container.updateContainer({ _id: containerId, action : 'stop'}).then(function(result){
                if(result && 'msg' in result && result.msg === 'ok'){
                    $scope.container.status = 'stop';
                }
            });
        };
        $scope.startContainer = function(){
            Container.updateContainer({ _id: containerId, action : 'start'}).then(function(result){
                console.log(result);
                if(result && 'msg' in result && result.msg === 'ok'){
                    $scope.container.status = 'running';
                }
            });
        };

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
