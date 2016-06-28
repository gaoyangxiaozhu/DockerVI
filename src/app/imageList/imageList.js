(function () {
	'use strict';

	angular.module('dockerApp.imageList',[])
	  .config(function ($stateProvider) {
	    $stateProvider
	      .state('imageList', {
	        url: '/images/list',
	        templateUrl: 'app/imageList/imageList.html',
	        controller: 'imageListCtrl'
	      });
	  });
})();
