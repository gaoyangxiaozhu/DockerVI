(function () {
  'use strict';

  angular.module('dockerApp.settings')
    .controller('LocalSignInCtrl', function ($rootScope, $scope, Auth, $state, $log, toaster, $cookies) {
      //获取验证码
      function getCaptcha() {
        $scope.captchaUrl = '/api/users/getCaptcha?' + Math.random();
      }
      getCaptcha();

      //更新验证码
      $scope.changeCaptcha = function () {
        getCaptcha();
      };

      $scope.user = {};
      function toLogin(){
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password,
          captcha: $scope.user.captcha
        })
          .then( function() {
            toaster.pop({
                type: 'success',
                title: '',
                body: '登录成功,欢迎光临!',
                timeout: 1000
            });
            $state.go('dashboard');
          })
          .catch( function(err) {
            $scope.user.captcha = '';
            getCaptcha();
            err = err.error_msg || err.data.error_msg || "登录失败,请重试";
            toaster.pop('error','',err);
            $cookies.remove('token');
          });
      }

      $scope.login = function(form) {
        if(form.$valid) {
          toLogin();
        }
      };
      $scope.loginPress = function(ev, form) {
        if (ev.which===13 && form.$valid){
          ev.preventDefault();
          toLogin();
        }
      };

    });
}());
