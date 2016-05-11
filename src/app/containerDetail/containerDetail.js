(function () {
	'use strict';

	angular.module('dockerApp.containerDetail',[])
	  .config(function ($stateProvider) {
	    $stateProvider
	      .state('containerDeatil', {
	        url: '/containers/:id/Deatil/',
            templateUrl: 'app/containerDeatil/containerDeatil.html',
	        controller: 'containerDeatilCtrl'
	      });
	  });
})();
