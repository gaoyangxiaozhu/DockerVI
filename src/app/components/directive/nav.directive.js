(function () {
   'use strict';

   angular.module('dockerApp.directives')
       .directive('nav', [function (){

           return {
               // Restrict to elements and attributes
               restrict:'C',
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
                el.find('li').on('click', function(){
                    var that = $(this);
                    if(!that.hasClass('active')){
                        that.addClass('active').siblings().removeClass('active');
                    }
                });

            }
    }]);
})();
