(function () {
	'use strict';

	angular.module('dockerApp.volume',[])
	  .config(function ($stateProvider) {
	    $stateProvider
	      .state('volume', {
	        url: '/volumes/',
	        templateUrl: 'app/volume/volume.html',
	        controller: 'volumeCtrl'
	      });
	  });
})();
