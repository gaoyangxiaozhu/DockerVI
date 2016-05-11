(function () {
	'use strict';

	angular.module('dockerApp.containerList',[])
	  .config(function ($stateProvider) {
	    $stateProvider
	      .state('containerList', {
	        url: '/containers/list/',
	        templateUrl: 'app/containerList/containerList.html',
	        controller: 'ContainerListCtrl'
	      });
	  });
})();
