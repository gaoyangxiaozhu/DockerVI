(function () {
   'use strict';

   angular.module('dockerApp.directives')
       .directive('cmchart', [function(){

           return {
               // Restrict to elements and attributes
               restrict:'EA',
               scope: {
                   option: '=chartOption'
               },
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
               scope.$watchCollection('[option]', function(){
                   if(scope.option){
                       build(scope, el, attr);
                   }
               });
           }
        /*
        * The main build function used to determine the logic
        *
        * @param {Object} scope - The local directive scope object
        * @param {Object} attrs - The local directive attribute object
        */
        function build(scope, el, attr){
            var that = echarts.init(el[0]);
            if(scope.option){
                that.setOption(scope.option);
            }
        }
    }]);
})();
