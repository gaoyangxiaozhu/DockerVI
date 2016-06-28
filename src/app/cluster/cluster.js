(function () {
	'use strict';

	angular.module('dockerApp.cluster',[])
	  .config(function ($stateProvider) {
	    $stateProvider
	      .state('cluster', {
	        url: '/cluster',
	        templateUrl: 'app/cluster/cluster.html',
	        controller: 'clusterCtrl'
	      });
	  });
})();
