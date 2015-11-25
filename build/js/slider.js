/**
 * @ngDoc directive
 * @name ng.directive:slider
 * @author gaoyangyang
 * @description
 * A directive to make it ease to choose number from a continuous range.
 *
 * @element EA
 *
 */
 angular.module('slider', []).directive('slider', function () {

     /**
      * The angular return value required for the directive
      * Feel free to tweak / fork values for your application
      */
     return {

         // Restrict to elements and attributes
         restrict: 'EA',

         // Assign the angular link function
         link: slideLink,

         // Assign the angular scope attribute formatting
         scope: {
             min: '@',
             max: '@',
             from: '=',
             to: '=',
             fromHide: '@',
         },

         // Assign the angular directive template HTML
         template:
             '<span class="slider slider-body"> ' +
                '<span class="slider-line" tabindex="-1"></span>'+
                '<span class="slider-bar"></span>'+
                '<span class="slider-bar-from slider-hander"></span>'+
                '<span class="slider-bar-to slider-hander"></span>'+
             '</span>'
     };


     /**
      * Link the directive to enable our scope watch values
      *
      * @param {object} scope - Angular link scope
      * @param {object} el - Angular link element
      * @param {object} attrs - Angular link attribute
      */
     function slideLink(scope, el, attrs) {
        // Hook in our watched items
         build(scope, el, attrs);
     }
    //  return change function
    // TODO 还有bug
     function doStartMove(scope){
         return function startMove(e){
             var that = angular.element(this);

             var dist = e.clientX - init.dX;
             var lX = init.lX;
             var rX = init.rX;
             var type=null;

             if(init.targer.hasClass('slider-bar-from')){
                 type="left";
             }else{
                 type="right";
             }
             switch(type){
                 case 'left':
                    lX = init.lX + dist; //leftBar 理论上的新位置横坐标
                    moveLeftBar();
                    break;
                 case 'right':
                    rX = init.rX + dist;
                    moveRightBar();
                    break;
             }
             function moveLeftBar(){
                 if(rX > lX+5 && line.x < lX && lX < line.y){
                     option={
                         'left': ((lX-line.x)/line.w).toFixed(3)*100+'%'
                     }
                     init.targer.css(option);
                     barOption={
                         'left':((lX-line.x)/line.w).toFixed(3)*100+'%',
                         'width': ((rX-lX)/line.w).toFixed(3)*100+'%'
                     }
                     line.e.css(barOption);
                 }
             }
             function moveRightBar(){
                 if(rX >= lX && line.x <= rX && rX <= line.y){
                     var pLeft=((rX-line.x)/line.w).toFixed(3)*100;
                     var option={
                         'left': pLeft+'%'
                     }
                     init.targer.css(option);
                     var pWidth=((rX- lX)/line.w).toFixed(3)*100;

                     var barOption={
                         'width': pWidth+'%'
                     }
                     line.e.css(barOption);
                     scope.to = parseInt(pWidth*(scope.max-scope.min)/100)+parseInt(scope.min);
                     scope.to = Math.min(scope.to, scope.max);
                     scope.$apply();

                 }
             }

         }
     }
    // TODO 需要优化
     function doChange(scope){
         return function change(e){
             var that = angular.element(this);
             init={
                  targer: that,
                  mX: that.offset().left,
                  lX: angular.element('.slider-bar-from.slider-hander').length? angular.element('.slider-bar-from.slider-hander').offset().left: line.x,
                  rX: angular.element('.slider-bar-to.slider-hander').offset().left,
                  dX: e.clientX //当前bar的初始位置 距离窗口左侧的距离

             }
             console.log(init);
             angular.element(document).off('mousemove.slider');
             angular.element(document).off('mouseup.slider');
             
             angular.element(document).on('mousemove.slider', doStartMove(scope));
             angular.element(document).on('mouseup.slider', function(){
                 angular.element(document).off('mousemove.slider');
                 console.log('up');
             });
         }
     }


     function removeFromHander(el, flag){
         if(flag){
             el.find('.slider-bar-from').remove();
         }
     }

     /**
      * The main build function used to determine the paging logic
      * Feel free to tweak / fork values for your application
      *
      * @param {Object} scope - The local directive scope object
      * @param {Object} attrs - The local directive attribute object
      */
     function build(scope, el, attrs) {


         var fromHander = el.find('.slider-bar-from.slider-hander');
         var toHander = el.find('.slider-bar-to.slider-hander');
         var sliderBar = el.find('.slider-bar');
         var slideLine = el.find('.slider-line');
         line ={
             x: slideLine.offset().left,
             y: slideLine.offset().left+slideLine.width(),
             w: slideLine.width(),
             e: sliderBar
         }

         // Block divide by 0 and empty page size
         if (!scope.min || scope.min <= 0) {
             scope.min = 0;
         }
         if(!scope.max || scope.max <= 0){
             scope.max = 100;
         }
         if(!scope.from || scope.from <=0){
             scope.from = scope.min;
         }
         if(!scope.to || scope.to <=0){
             scope.to= scope.max;
         }

        removeFromHander(el, scope.fromHide);
        fromHander.on('mousedown', doChange(scope));
        toHander.on('mousedown', doChange(scope));

     }

 });
