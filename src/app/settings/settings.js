(function () {
  'use strict';

  angular.module('dockerApp.settings',[])
    .config(function ($stateProvider) {
      $stateProvider
        .state('signin', {
          url: '/signin',
          templateUrl: 'app/settings/signin.html',
          controller: 'LocalSignInCtrl'
        })
        .state('setting', {
          url: '/setting',
          templateUrl: 'app/settings/userSetting.html',
          controller: 'SettingCtrl',
          onlyUser:true
        });
    });
})();
