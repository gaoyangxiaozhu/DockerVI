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
             single: '=',
         },

         // Assign the angular directive template HTML
         template:
             '<span class="slider slider-body"> ' +
                '<span class="slider-line-before"></span>'+
                '<span class="slider-line" tabindex="-1"></span>'+
                '<span class="slider-line-after"></span>'+
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

     /**
      * The main build function used to determine the paging logic
      * Feel free to tweak / fork values for your application
      *
      * @param {Object} scope - The local directive scope object
      * @param {Object} attrs - The local directive attribute object
      */
     function build(scope, el, attrs) {


         var leftBtn = el.find('.slider-bar-from.slider-hander');
         var rightBtn = el.find('.slider-bar-to.slider-hander');
         var sliderBar = el.find('.slider-bar');
         var slideLine = el.find('.slider-line');

         rightBtn.data('type', 'right');
         leftBtn.data('type', 'left');

         var line ={
             x: slideLine.offset().left,
             y: slideLine.offset().left+slideLine.width(),
             w: slideLine.width(),
             bar: sliderBar
         }


         // avoid  negative number or none
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
         var option={
             min: scope.min,
             max: scope.max,
             from: scope.from,
             to: scope.to,
             single: scope.single? scope.single: false
         }

         var init={};//用于每次mousedown事件中hander的位置的初始化
         var target=null;

        function startMove(e){

            e = e || window.event;
            if(!init.drag) return;

            var newPoint = e.clientX;
            var type= target.data('type');

            switch(type){
                case 'left':
                     moveLeftBar();
                     break;
                case 'right':
                     moveRightBar();
                     break;
             }
            function updateTargetLeft(){
                var len = Math.abs(newPoint-init.oX); //移动的距离
                var percentLeft = (newPoint-line.x)/line.w
                percentLeft*=100;

                var css={
                    'left': percentLeft+'%'
                    }
                target.css(css);
              }
            function moveLeftBar(){
              newPoint = newPoint >= init.rX ? init.rX : newPoint
              newPoint = newPoint <= line.x ? line.x : newPoint
              updateTargetLeft();

              var percentWidth=(init.rX - newPoint)/line.w;
              percentWidth*=100;
              var percentLeft=(newPoint - line.x)/line.w;
              percentLeft*=100;
              var css={
                  'width': percentWidth+'%',
                  'left': percentLeft+'%'
              }
              line.bar.css(css);
              //更新scope.from
              scope.from = parseInt((newPoint-line.x)/line.w*100*(scope.max-scope.min)/100)+parseInt(scope.min);
              scope.from = Math.max(scope.min, scope.from);
              scope.$apply();

            }
          function moveRightBar(){
              newPoint = newPoint <= init.lX ? init.lX : newPoint
              newPoint = newPoint >= line.y ? line.y : newPoint
              updateTargetLeft();
              var percentWidth=((newPoint-init.lX)/line.w);
              percentWidth*=100;

              var css={
                    'width': percentWidth+'%'
                  }
             line.bar.css(css);
             //更新scope.to
             scope.to = parseInt((newPoint-line.x)/line.w*100*(scope.max-scope.min)/100)+parseInt(scope.min);
             scope.to = Math.min(scope.to, scope.max);
             scope.$apply();
             }
             //防止丢失mouseup事件
             target.setCapture && this.setCapture();
             return false;
        }

         function stopMove(e){
              init.drag= false;
              //解除capture
              if(target){
                  target.releaseCapture && target.releaseCapture();
              }

         }

         function change(e){
            e = e || window.event;
            var that = angular.element(this);
            target = that;
            init={
               oX: e.clientX, //当前bar的初始位置 距离窗口左侧的距离
               lX: option.single? line.x: leftBtn.offset().left,
               rX: rightBtn.offset().left,
               drag: true
            }

          }
        function removeLeftBtn(hide){
          if(hide){
              el.find('.slider-bar-from').remove();
              el.find('.slider-line-before').remove();
          }
        }

        function initPositionForLeftRightBtn(){
            var css={
                'left':'0%'
            }
            leftBtn.css(css);
            css={
                'left':'100%'
            }
            rightBtn.css(css);
        }
        removeLeftBtn(option.single);
        initPositionForLeftRightBtn();

        if(!option.single){
            leftBtn.on('mousedown', change);
        }
        rightBtn.on('mousedown', change);
        angular.element(document).on('mousemove.slider', startMove);
        angular.element(document).on('mouseup.slider', stopMove);

     }

 });
