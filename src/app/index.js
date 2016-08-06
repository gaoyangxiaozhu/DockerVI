/**
 * dockerApp初始化入口文件
 */
(function () {
   'use strict';

   angular.module('dockerApp', [
           'ngAnimate',
           'ngCookies',
           'ngTouch',
           'ngSanitize',
           'ui.router',
           'ui.bootstrap',
           'ngLodash',
           'ngProgress',
           'toaster',
           'ngFileUpload',
           'bw.paging',
           'oitozero.ngSweetAlert',
           'dockerApp.manage',
           'dockerApp.settings',
           'dockerApp.resources',
           'dockerApp.service',
           'dockerApp.directives',
           'dockerApp.containers',
           'dockerApp.imageList',
           'dockerApp.volume',
           'dockerApp.cluster'
       ])
   .config(function ($logProvider, $stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, IsDebug) {

       $locationProvider.html5Mode(true);
       $httpProvider.defaults.timeout = 600000;
       $httpProvider.interceptors.push('AutoInterceptor');

       // Enable log
       $logProvider.debugEnabled(IsDebug);
       $urlRouterProvider.otherwise('/');
   })
    .run(function ($rootScope, ngProgressFactory, $state, lodash, Auth, $cookies, toaster) {

            //默认头像
            $rootScope.default_avatar = '/assets/images/avatar.png'

           //加载进度
           $rootScope.progressbar = ngProgressFactory.createInstance();

           //登录之后不可进入页面.
			var routesThatForLogins  = ['/signin'];

			var routeLogin  = function (route) {
				return lodash.find(routesThatForLogins,
					function (noAuthRoute) {
						return lodash.startsWith(route, noAuthRoute);
					});
			};
           // 页面权限判断
           $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams){
               $rootScope.progressbar.setColor('green');
               $rootScope.progressbar.reset(); // Required to handle all edge cases.
               $rootScope.progressbar.start();
               if(!$rootScope.load || Object.prototype.toString.call($rootScope.load) != '[object Object]'){
                   $rootScope.load = {};
               }

               if(toState.name === 'dashboard' || toState.name === 'home'){
                   $rootScope.pageClass = "dashboard"; //只有home/main/signin页面不显示侧边栏
                   if(toState.name === 'home'){
                       $rootScope.home = true;
                   }else{
                       $rootScope.home = false;
                   }
               }else{
                   if(toState.name === "signin"){
                       $rootScope.pageClass = "signin";
                   }else{
                       $rootScope.pageClass = "";
                   }
               }
               $rootScope.load.loaded = false;
               //已登录就需要跳转的页面
				Auth.isLoggedInAsync(function(loggedIn) {
                    if((routeLogin(toState.url) && loggedIn) || (toState.onlyAdmin && !Auth.isAdmin() && loggedIn)){
                        event.preventDefault();
                        // if(!fromState || fromState.name === 'home'){ //如果本身就在home页面 $state.go('home')将不会实际执行
                        //     $rootScope.home = true;
                        //     $rootScope.load.loaded = true;
                        //     $rootScope.pageClass = "dashboard";
                        //     $rootScope.progressbar.complete();
                        // }else{
                        //     $state.go('home');
                        // }
                        $state.go('dashboard');
                    }
                    if((toState.onlyUser && !loggedIn) || (toState.onlyAdmin && !Auth.isAdmin() && !loggedIn)){
                        event.preventDefault();
                        $state.go('signin');
                    }
                });
           });

           // When route successfully changed.
           $rootScope.$on('$stateChangeSuccess', function(ev, toState, toParams, fromState, fromParams) {
               $rootScope.load.loaded = true;
               $rootScope.progressbar.complete();
               $rootScope.previousState = fromState;
               $rootScope.previousParams = fromParams;
               $rootScope.currentState = toState;
           });

           // When some error occured.
           $rootScope.$on('$stateChangeError', function() {
               $rootScope.progressbar.reset();
           });

     });
})();
