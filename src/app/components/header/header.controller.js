(function(){
    angular.module("dockerApp")
    .controller('headerCtrl', ['$scope','$rootScope', '$state', '$stateParams', '$location', 'Auth', function($scope,  $rootScope, $state, $stateParams, $location, Auth){

        $scope.user = Auth.getCurrentUser();

        $scope.manageUser = function(){
            $state.go('userList');
        };
        $scope.logout = function(){
            Auth.logout();
            $state.go('home');
        };

    }]);
})();
