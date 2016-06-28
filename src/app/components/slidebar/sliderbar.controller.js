(function(){
    angular.module("dockerApp")
    .controller('navBarCtrl', ['$scope','$rootScope', '$state', '$stateParams', '$location', function($scope,  $rootScope, $state, $stateParams, $location){

        $scope.currentUrl = {};
        $scope.currentUrl.docker = $location.url() +'#icon-docker';
        $scope.currentUrl.server = $location.url() +'#icon-server';
        $scope.currentUrl.shop = $location.url() + '#icon-shop';
        $scope.currentUrl.applist = $location.url() + '#symbol-icon_applist';
        $scope.currentUrl.volume = $location.url() + '#icon-volume';

        $scope.navs= [];
        for(var i=0; i<4; i++){
            var nav = {};
            nav.active = false;
            $scope.navs.push(nav);
        }
        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
            switch ($rootScope.currentState.name) {
                case 'cluster':
                    $scope.navs[0].active = true;
                    break;
                case 'imageList':
                    $scope.navs[1].active = true;
                    break;
                case 'containerList':
                    $scope.navs[2].active = true;
                    break;
                case 'volume':
                    $scope.navs[3].actice = true;
                    break;
            }
        });

    }]);
})();
