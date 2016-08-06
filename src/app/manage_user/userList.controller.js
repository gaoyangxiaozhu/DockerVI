(function () {
  'use strict';

  angular.module('dockerApp.manage')
    .controller('UserListCtrl', function($scope, $modal, $state, User, toaster, SweetAlert){
     //初始数据
     $scope.options = {
      currentPage:1,        //当前页数
      itemsPerPage:10,      //每页显示的条数
      sortName:'created',       //排序项
      sortOrder:false         //升降
     };
     $scope.changeSort = function(sortName){
      if($scope.options.sortName === sortName){
        $scope.options.sortOrder = !$scope.options.sortOrder;
      }
      $scope.options.sortName = sortName;
     };
     $scope.maxSize = 5;        //分页条最大显示数
     $scope.$watchCollection(
      'options',
      function(newValue, oldValue) {
        doPaging(newValue);
      }
     );
     function doPaging(options) {
      User.getUserList(options, function(users){
        $scope.userList = users.data;
        $scope.bigTotalItems = users.count;
      },function(err){
        $scope.userList = [];
      });
     }


      //删除
      $scope.del = function (user) {
          SweetAlert.swal({
              title: "你确定?",
              text: "你将删除选中的"+ user.nickname +"用户",
              type: "warning",
              showCancelButton: true,
              cancelButtonText: "取消",
              confirmButtonColor: "#DD6B55",
              confirmButtonText: "是的, 我要删除!",
              closeOnConfirm: false,
              showLoaderOnConfirm: true },
              function(isConfirm){
                  if(isConfirm){
                      window.swal.close(); //关闭SweetAlert
                      User.deleteUser({id:user._id}).then(function () {
                        toaster.pop('success', '', '删除用户' + user.nickname + '成功');
                        doPaging($scope.options);
                      }).catch(function (err) {
                        err = err.data.error_msg || '删除用户失败';
                        toaster.pop('error', '', err);
                      });
                  }
              });
  };
      //增加
      $scope.add = function (size) {
        var modalAdd = $modal.open({
          templateUrl: 'app/manage_user/userAdd.html',
          controller: 'ModalAddUserCtrl',
          size: size,
        });

        modalAdd.result.then(function (nickname) {
          toaster.pop('success', '', '添加用户 '+nickname+' 成功');
          doPaging($scope.options);
        }).catch(function (err) {
            if(typeof err === 'object'){
                err = err.message || err.data.error_msg;
            }
            if(err && err !== "cancel"){
                toaster.pop('error', '', err);
            }
        });
      };
      //编辑
      $scope.edit = function (user) {
        var modalEdit = $modal.open({
          templateUrl: 'app/manage_user/userEdit.html',
          controller: 'ModalEditUserCtrl',
          resolve: {
              currentUser: function () {
                  return user;
              }
          }
        });

        modalEdit.result.then(function (nickname) {
          toaster.pop('success', '', '编辑用户 '+nickname+' 成功');
          doPaging($scope.options);
        });
      };

    })
    .controller('ModalAddUserCtrl',function ($scope, $modalInstance, User, toaster) {
      $scope.user = {};
      $scope.ok = function (form) {
            if(form.$valid){
              User.addUser($scope.user).then(function(){
                  $modalInstance.close($scope.user.nickname);
              }).catch( function(err) {
                err = err.data.error_msg || '添加用户失败';
                toaster.pop('error', '', err);
              });
            }
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    })
    .controller('ModalEditUserCtrl',function ($scope, $modalInstance, User, toaster, currentUser) {
      $scope.currentUser = currentUser;

      $scope.ok = function (form) {
            if(form.$valid){
              User.updateUser($scope.currentUser._id, $scope.currentUser).then(function(){
                  $modalInstance.close($scope.currentUser.nickname);
              }).catch( function(err) {
                  err = err.data.error_msg || '编辑用户失败';
                  toaster.pop('error', '', err);
              });
            }
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    });
})();
