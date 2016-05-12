(function () {
	'use strict';

	angular.module('dockerApp')
	.config(function ($stateProvider) {
		$stateProvider
		  .state('home', {
		    url: '/',
		    templateUrl: 'app/main/main.html',
		    controller: 'MainCtrl'
		  });
	});
})();
