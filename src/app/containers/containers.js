(function () {
  'use strict';

  angular.module('dockerApp.containers',[])
    .config(function ($stateProvider) {
      $stateProvider
      .state('containerList', {
        url: '/containers/list/',
        templateUrl: 'app/containerList/containerList.html',
        controller: 'ContainerListCtrl'
      })
      .state('containerDeatil', {
        url: '/containers/:id/Deatil/',
        templateUrl: 'app/containerDeatil/containerDeatil.html',
        controller: 'containerDeatilCtrl'
      })
      .state('containerCreate', {
        url: '/containers/create/',
        templateUrl: 'app/containerCreate/containerCreate.html',
        controller: 'containerCreateCtrl'
    });
    });
})();
