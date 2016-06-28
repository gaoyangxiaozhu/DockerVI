(function () {
  'use strict';

  angular.module('dockerApp.containers', [])
    .config(function ($stateProvider) {
      $stateProvider
      .state('containerList', {
        url : '/containers/list',
        templateUrl : 'app/containerList/containerList.html',
        controller : 'ContainerListCtrl',
        params:{
            newContainer: undefined,
            removeContainer : undefined
        }
      })
      .state('containerDetail', {
        url : '/containers/:id/Detail',
        templateUrl : 'app/containerDetail/containerDetail.html',
        controller : 'containerDetailCtrl',
        params:{
            new: undefined
        }
      })
      .state('containerCreate', {
        url: '/create/:id/:source',
        templateUrl : 'app/containerCreate/containerCreate.html',
        controller : 'containerCreateCtrl',
        controllerAs : 'ctrl',
        params:{
            source : 'local'
            }
        });
    });
})();
