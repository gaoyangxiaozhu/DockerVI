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
           'dockerApp.resources',
           'dockerApp.service',
           'dockerApp.directives',
           'dockerApp.imageList',
           'dockerApp.containerList',
           'dockerApp.containerCreate',
           'dockerApp.containerDetail',
       ])
   .config(function ($logProvider,$stateProvider, $urlRouterProvider, $locationProvider, $httpProvider,IsDebug) {
     $locationProvider.html5Mode(true);
     $httpProvider.defaults.timeout = 500000;
     $httpProvider.interceptors.push('AuthInterceptor');
     // Enable log
     $logProvider.debugEnabled(IsDebug);
     $urlRouterProvider.otherwise('/');
   })
     .run(function ($rootScope, ngProgressFactory, $state, lodash, $cookies, toaster) {
           //默认头像
           $rootScope.default_avatar = '/assets/images/avatar.png';
           //登录模块.
           $rootScope.opneSnsModal = function () {
               CustomModalService.open('SnsSignInCtrl','app/settings/sns_sign_in.html');
           };
           //加载进度
           $rootScope.progressbar = ngProgressFactory.createInstance();

           // 页面权限判断
           $rootScope.$on('$stateChangeStart', function (event, toState) {
               $rootScope.progressbar.setColor('green');
                   $rootScope.progressbar.reset(); // Required to handle all edge cases.
                   $rootScope.progressbar.start();
                   event.preventDefault();
                   $state.go('home');
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
