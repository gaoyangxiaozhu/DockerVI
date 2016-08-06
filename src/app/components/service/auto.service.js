(function () {
  'use strict';

  angular.module('dockerApp.service')
    .factory('Auth', function Auth($location, $rootScope, $http, User, $cookies, $q, lodash, $window) {
      var currentUser = {};
      if($cookies.get('token')) {
        currentUser = User.get();
      }

      return {
        login: function(user, callback) {
          var cb = callback || angular.noop;
          var deferred = $q.defer();

          $http.post('/auth/local', {
            email: user.email,
            password: user.password,
            captcha: user.captcha
          }).
          success(function(data) {
            $cookies.put('token', data.token);
            currentUser = User.get();
            deferred.resolve(data);
            return cb();
          }).
          error(function(err) {
            this.logout();
            deferred.reject(err);
            return cb(err);
          }.bind(this));

          return deferred.promise;
        },

        logout: function() {
          $cookies.remove('token');
          currentUser = {};
        },

        getCurrentUser: function() {
          return currentUser;
        },

        isLoggedIn: function() {
          return currentUser.hasOwnProperty('role');
        },

        /**
         * 检测用户是否登录
         */
        isLoggedInAsync: function(cb) {
          if(currentUser.hasOwnProperty('$promise')) {
            currentUser.$promise.then(function() {
              cb(true);
            }).catch(function() {
              cb(false);
            });
          } else if(currentUser.hasOwnProperty('role')) {
            cb(true);
          } else {
            cb(false);
          }
        },

        isLike: function (aid) {
          var index = lodash.findIndex(currentUser.likes,function (item) {
            return item.toString() === aid;
          });
          return (index !== -1)?true:false;
        },

        isAdmin: function() {
          return currentUser.role === 'admin';
        },

        getToken: function() {
          return $cookies.get('token');
        }
      };
    });
})();
