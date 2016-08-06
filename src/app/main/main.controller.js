(function(){
    angular.module("dockerApp")
    .controller('MainCtrl', ['$rootScope', '$scope', '$location', '$state',  function($rootScope, $scope, $location, $state){
         $scope.goToDashboard = function(){
             $state.go(
                 'dashboard'
            );
        };
    }])
    .controller('DashboardCtrl', ['$rootScope', '$scope', '$location', '$state',  function($rootScope, $scope, $location, $state){

    }]);
})();
