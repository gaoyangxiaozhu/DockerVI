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
           'dockerApp.resources',
           'dockerApp.service',
           'dockerApp.directives',
           'dockerApp.imageList',
           'dockerApp.containerList',
           'dockerApp.containerCreate',
           'dockerApp.containerDetail',
       ])
   .config(function ($logProvider, $stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, IsDebug) {

     $locationProvider.html5Mode(true);
     $httpProvider.defaults.timeout = 500000;
     // Enable log
     $logProvider.debugEnabled(IsDebug);
     $urlRouterProvider.otherwise('/');

   })
     .run(function ($rootScope, ngProgressFactory, $state, lodash, $cookies, toaster) {
           //默认头像
           $rootScope.default_avatar = '/assets/images/avatar.png';
           //加载进度
           $rootScope.progressbar = ngProgressFactory.createInstance();

           $rootScope.$on('$stateChangeStart', function (event, toState) {
               $rootScope.progressbar.setColor('green');
                   $rootScope.progressbar.reset(); // Required to handle all edge cases.
                   $rootScope.progressbar.start();
           });

           // When route successfully changed.
           $rootScope.$on('$stateChangeSuccess', function(ev,toState,toParams,fromState,fromParams) {
               $rootScope.progressbar.complete();
               $rootScope.previousState = fromState;
               $rootScope.previousParams = fromParams;
           });

           // When some error occured.
           $rootScope.$on('$stateChangeError', function() {
               $rootScope.progressbar.reset();
           });

     });
})();
