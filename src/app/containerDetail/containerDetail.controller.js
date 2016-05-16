(function(){
    angular.module("dockerApp.containers")
    .controller('containerDetailCtrl', ['$scope', 'Container', '$state', '$stateParams', function($scope, Container, $state, $stateParams){

        //其实是name
        var containerId = $state.params.id;
        Container.getContainer({id: containerId}).then(function(results){
            
        });
    }]);
})();
