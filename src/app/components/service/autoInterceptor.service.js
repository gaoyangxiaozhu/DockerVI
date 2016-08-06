(function () {
	'use strict';

	angular.module('dockerApp.service')
		.factory('AutoInterceptor', function ($rootScope, $q, $cookies, $location, $injector) {
			var Auth;
		  return {
			  request: function (config) {
		      config.headers = config.headers || {};
		      if ($cookies.get('token')) {
		        config.headers.Authorization = 'Bearer ' + $cookies.get('token').replace(/(^\")|(\"$)/g, "");
		      }
		      return config;
		    },
	      	response: function (response) {
				return response;
	      },
		  	responseError:function(rejection){
				if (rejection.status === 401) {
					Auth = $injector.get('Auth');
					Auth.logout();
					$location.path('/signin');
					return $q.reject(rejection);
				}else {
					return $q.reject(rejection);
					}
				}
		  };
		});
})();
