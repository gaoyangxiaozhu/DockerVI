(function () {
	'use strict';

	angular.module('dockerApp.volume',[])
	  .config(function ($stateProvider) {
	    $stateProvider
	      .state('volume', {
	        url: '/volumes',
	        templateUrl: 'app/volume/volume.html',
	        controller: 'volumeCtrl',
			params:{
				newVolume : undefined
			}
	      })
		  .state('volumeCreate', {
	        url: '/volumes/new',
	        templateUrl: 'app/volume/newVolume.html',
	        controller: 'volumeCreateCtrl'
	      });
	  });
})();
