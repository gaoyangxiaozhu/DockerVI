(function () {
   'use strict';

   angular.module('dockerApp.directives')
       .directive('containerLog', ['Container', function (Container) {

           var socket;

           return {
               // Restrict to elements and attributes
               restrict:'EA',
               replace:true,
               // Assign the angular scope attribute formatting
               scope:{
                 container: '=container',
                 init:'=init'
               },
                // Assign the angular directive template HTML
               template: filedTemplete,
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

               scope.$watchCollection('[container, init]', function(){
                      build(scope, el, attr);
               });
           }
           /**
            * Create our template html
            * We use a function to figure out how to handle href correctly
            *
            * @param {object} el - Angular link element
            * @param {object} attrs - Angular link attribute
            */
           function filedTemplete(el, attrs){
               return '<pre class="darken">' +
                            '<div ng-if="!logs || loadingPrevious">' +
                                '<span>' +
                                    'Loading...' +
                                    '<span class="sr-only">' +
                                        'Loading...' +
                                        '</span>' +
                                '</span>' +
                            '</div>' +
                            '<div ng-if="logs && logs.length === 0">' +
                                '<span>' +
                                    '没有日志内容' +
                                '</span>' +
                            '</div>' +
                            '<div class="log-item" ng-repeat="log in logs">' +
                                '<span class="t" ng-if="log.time">' +
                                    '{{ log.time }}' +
                                '</span>' +
                                '<span class="c" ng-if="log.time">' + ':' + '</span>' +
                                '{{ log.message }}' +
                            '</div>' +
                        '</pre>';
           }

        function connectSocket(scope, el){

            var mouseState; //鼠标状态 中间位置　底部　顶部
            var progress = false; //是否正在加载数据
            var readDone = false; //已有的日志内容是否已经读完
            var currentScrollHeight;
            var currentScrollTop;
            var beforeScrollHeight;
            var $content = $(el);

            var container = scope.container; //当前容器信息


            if(!socket){
                socket = io.connect('http://localhost:9000/logs');
            }

            socket.on('notice', function(msg){
                if(msg == 'OK'){
                    scope.loadingPrevious = true;
                    socket.emit('init', scope.container.name, scope.container.status);
                }
                if(msg == 'done'){ //日志读取完
                    scope.loadingPrevious = false;
                    readDone = true;
                }
                scope.$apply();
            });
            socket.on('getReadyForNewLogText', function(){
                if(mouseState == 'down'){
                    //如果鼠标位于最下方 接收新的数据
                    scope.loadingPrevious = true;
                    socket.emit('sendNewLogText');
                }

            });

            socket.on('getContainerLogText', function(data, option){
                var scrollFunc;

                if(option && option == 'init'){

                    scope.logs = data;
                    scope.loadingPrevious = false;
                    scope.$apply();

                    currentScrollHeight = beforeScrollHeight =  $content[0].scrollHeight;
                    $content.scrollTop(currentScrollHeight - $content.height());
                    mouseState = 'down';

                    scrollFunc = (function(){
                          return function(){

                            currentScrollTop = $content.scrollTop();
                            //如果鼠标滚动到顶部
                            if(parseInt(currentScrollTop) === 0 && !progress && !readDone){
                                mouseState = 'up';
                                progress = true;
                                scope.loadingPrevious = true;
                                scope.$apply();
                                socket.emit('getMoreLogContent');
                            }else
                                  if(parseInt(currentScrollTop) >= parseInt(currentScrollHeight - $content.height()) && !progress){ //如果鼠标滚动到底部
                                      mouseState = 'down';
                                      console.log(mouseState);
                                      progress = true;
                                      //接收新数据
                                      socket.emit('sendNewLogText');

                                  }else{//鼠标位于中间某个位置
                                      mouseState = 'middle';
                                  }
                          };
                    })();
                    setTimeout(function(){
                        $content.on('scroll', scrollFunc);
                    },0);
                }else{
                    scope.loadingPrevious = false;
                    scope.logs = data.concat(scope.logs);
                    scope.$apply();

                    currentScrollHeight = $content[0].scrollHeight;
                    $content.scrollTop(currentScrollHeight - beforeScrollHeight); //定位到更新数据之前的位置
                    beforeScrollHeight = currentScrollHeight;// 更新beforeScrollHeight
                    progress = false;
                }
            });

            socket.on('getNewLogText', function(data){

                scope.loadingPrevious = false;
                scope.logs = data;
                currentScrollHeight  =  $content[0].scrollHeight;
                currentScrollTop = $content[0].scrollTop;
                $content.scrollTop(currentScrollHeight - $content.height()); //滚动到底部
                progress = false;
                mouseState = 'down';
             });
        }
       /**
        * The main build function used to determine the logic
        *
        * @param {Object} scope - The local directive scope object
        * @param {Object} attrs - The local directive attribute object
        */
        function build(scope, el, attr){

            /******scope相关变量********/
            scope.loadingPrevious = false;
            /***********end********/

            //建立socket连接
            if(scope.init){
                connectSocket(scope, el);
            }
        }
    }]);
})();
