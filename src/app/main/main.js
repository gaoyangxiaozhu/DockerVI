(function () {
	'use strict';

	angular.module('dockerApp')
	.config(function ($stateProvider) {
		$stateProvider
		  .state('home', {
		    url: '/',
			views:{
				'home':{
					templateUrl: 'app/main/main.html',
				    controller: 'MainCtrl'
				}
			}
		  })
		  .state('dashboard', {
			  url : '/dashboard',
			  templateUrl : 'app/main/dashboard.html',
			  controller : 'DashboardCtrl',
			  onlyUser : true
		  });
	});
})();
