(function () {
  'use strict';

  angular.module('dockerApp.manage',[])
    .config(function ($stateProvider) {
      $stateProvider
        .state('userList',{
          url:'/userlist',
          templateUrl:'app/manage_user/userList.html',
          controller:'UserListCtrl',
          onlyAdmin:true
        });
    });
})();
