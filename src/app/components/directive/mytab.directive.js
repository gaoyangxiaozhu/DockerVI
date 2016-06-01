(function () {
   'use strict';

   angular.module('dockerApp.directives')
       .directive('mytab', ['Container', function (Container) {

           return {
               // Restrict to elements and attributes
               restrict:'EA',
               // Assign the angular link function
               link: filedLink
           };

           /**
            * Link the directive to enable our scope watch values
            *
            * @param {object} scope - Angular link scope
            * @param {object} el - Angular link element
            * @param {object} attrs - Angular link attribute
            */
           function filedLink(scope, el, attr){
               build(scope, el, attr);
           }

           /**
            * The main build function used to determine the logic
            *
            * @param {Object} scope - The local directive scope object
            * @param {Object} attrs - The local directive attribute object
            */
            function build(scope, el, attr){
                el.on('click', function(){
                    var that = $(this);
                    var $parent = that.parent('li');

                    var targetId = that.attr('href');
                    var $target = $(targetId);

                    if(!$parent.hasClass('active')){
                        $parent.addClass('active').siblings().removeClass('active');
                        $target.addClass('active').siblings().removeClass('active');
                    }
                });

            }
    }]);
})();
