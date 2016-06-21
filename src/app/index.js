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
       // Enable log
       $logProvider.debugEnabled(IsDebug);
       $urlRouterProvider.otherwise('/dashboard');
   })
    .run(function ($rootScope, ngProgressFactory, $state, lodash, $cookies, toaster) {
           //加载进度
           $rootScope.progressbar = ngProgressFactory.createInstance();

           $rootScope.$on('$stateChangeStart', function (event, toState){
               //只有home/main页面不显示侧边栏
               if(!$rootScope.load || Object.prototype.toString.call($rootScope.load)!='[object Object]'){
                   $rootScope.load = {};
               }
               if(toState.name == 'dashboard' || toState.name == 'home'){
                   $rootScope.pageClass = "dashboard";
                   if(toState.name == 'home'){
                       $rootScope.home = true;
                   }else{
                       $rootScope.home = false;
                   }
               }else{
                   $rootScope.pageClass = "";
               }
               $rootScope.load.loaded = false;
               $rootScope.progressbar.setColor('green');
               $rootScope.progressbar.reset(); // Required to handle all edge cases.
               $rootScope.progressbar.start();
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
