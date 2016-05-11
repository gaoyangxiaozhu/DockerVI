(function () {
	'use strict';

	angular.module('dockerApp.containerCreate',[])
	  .config(function ($stateProvider) {
	    $stateProvider
	      .state('containerCreate', {
	        url: '/containers/create/',
	        templateUrl: 'app/containerCreate/containerCreate.html',
	        controller: 'containerCreateCtrl'
	      });
	  });
})();
