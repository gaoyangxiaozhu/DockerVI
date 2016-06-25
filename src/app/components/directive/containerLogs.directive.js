(function () {
   'use strict';

   angular.module('dockerApp.directives')
       .directive('containerLog', ['Container', function (Container) {

           var socket;

           var mouseState; //鼠标状态 中间位置　底部　顶部
           var progress = false; //是否正在加载数据
           var readDone = false; //已有的日志内容是否已经读完
           var currentScrollHeight;
           var currentScrollTop;
           var beforeScrollHeight;
           var $content;
           var currentStatus;

           var container; //当前容器信息


           return {
               // Restrict to elements and attributes
               restrict:'EA',
               replace:true,
               // Assign the angular scope attribute formatting
               scope:{
                 container: '=',
                 status: '=',
                 init:'=',
                 loadingClass: '@' //loading 效果
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

               $content = $(el);

               scope.$watchCollection('[container, status, init]', function(){
                   if(scope.container){
                       scope.container = scope.container;
                       build(scope, el, attr);
                   }

                   if(scope.status){
                       if(!currentStatus){ //第一次初始化currentStatus
                           currentStatus = scope.status;
                       }else{
                           //若如果当前状态不等于running 并且 scope.status == 'running' 说明重启了服务
                           if(currentStatus != scope.status && scope.status == 'running' && currentStatus == 'stop'){
                               if(socket){
                                   console.log('emit reMonitorForLogStartFromCurTime');
                                   socket.emit('reMonitorForLogStartFromCurTime');
                                   if(mouseState == 'down'){
                                       //如果鼠标位于最下方 则显示loading....
                                       scope.loadingNew = true;
                                   }
                               }
                           }
                           currentStatus = scope.status; //更新当前的status
                       }
                   }

               });
               scope.$on("$destroy", function() {
                   //关闭当前socket连接并注销socket
                   if(socket){
                       socket.close();
                       socket = null;
                   }
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
                                '<span ng-class="loadingClass">' +
                                    'Loading' +
                                    '<span class="circle one">' + '</span>' +
                                    '<span class="circle two">' + '</span>' +
                                    '<span class="circle three">' + '</span>' +
                                    '<span class="sr-only">' +
                                        'Loading...' +
                                        '</span>' +
                                '</span>' +
                            '</div>' +
                            '<div ng-if="logs && logs.length === 0 && !loadingPrevious &&!loadingNew">' +
                                '<span>' +
                                    '没有日志内容' +
                                '</span>' +
                            '</div>' +
                            '<div class="log-item" ng-repeat="log in logs track by $index">' +
                                '<span class="t" ng-if="log.time">' +
                                    '{{ log.time }}' +
                                '</span>' +
                                '<span class="c" ng-if="log.time">' + ':' + '</span>' +
                                '{{ log.message }}' +
                            '</div>' +
                            '<div ng-if="loadingNew">' +
                                '<span ng-class="loadingClass">' +
                                    'Loading' +
                                    '<span class="circle one">' + '</span>' +
                                    '<span class="circle two">' + '</span>' +
                                    '<span class="circle three">' + '</span>' +
                                    '<span class="sr-only">' +
                                        'Loading...' +
                                        '</span>' +
                                '</span>' +
                            '</div>' +
                        '</pre>';
           }
        /**
         * @description 用于建立容器日志服务的socket初始化　只在init为true时调用一次
         **/
        function connectSocket(scope, el){


            socket = io.connect('http://localhost:9090/logs');

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
            //TODO
            //message和　notice的功能类似　都是用于在特殊情况下进行消息通知(如出错　获取内容为空)
            //这里通过msgObj更规范的接收数据　根据code属性判断当前通知的类型　后期需要将notice和message功能合并
            //
            socket.on('message', function(msgObj){
                if(msgObj && msgObj.code === 0){ //说明获取的日志内容为空
                    scope.loadingNew = false;
                    scope.loadingPrevious = false;

                    scope.$apply();
                }
            });
            socket.on('getReadyForNewLogText', function(){
                console.log(mouseState);
                if(mouseState == 'down'){
                    //如果鼠标位于最下方 接收新的数据
                    if(!scope.loadingNew){
                        scope.loadingNew = true;
                        scope.$apply();
                    }
                    console.log('loadingNew');
                    socket.emit('sendNewLogText');
                }

            });
            //用于历史日志内容的获取
            socket.on('getContainerLogText', function(data, option){
                var scrollFunc;

                if(option && option == 'init'){
                    scope.logs = data;
                    scope.loadingPrevious = false;
                    scope.$apply();

                    //鼠标滚动到底部
                    currentScrollHeight = beforeScrollHeight =  $content[0].scrollHeight - 19; //注意: 这里要减掉pre标签的padding值　这里是19px
                    $content.scrollTop(currentScrollHeight - $content.height());
                    mouseState = 'down';

                    scrollFunc = (function(){
                          return function(){

                            currentScrollTop = $content.scrollTop();
                            //如果鼠标滚动到顶部
                            if(parseInt(currentScrollTop) === 0){
                                mouseState = 'up'; //更新mouseState

                                if(!progress && !readDone){
                                    progress = true;
                                    scope.loadingPrevious = true;
                                    scope.$apply();
                                    socket.emit('getMoreLogContent');
                                }

                            }else
                                  if(parseInt(currentScrollTop) >= parseInt(currentScrollHeight - $content.height())){ //如果鼠标滚动到底部
                                      mouseState = 'down';
                                      if(!progress){
                                          progress = true;
                                          scope.loadingNew = true;
                                          scope.$apply();
                                          //接收新数据
                                          socket.emit('sendNewLogText');
                                      }
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

                    currentScrollHeight = $content[0].scrollHeight - 19; //减去padding值
                    $content.scrollTop(currentScrollHeight - beforeScrollHeight); //定位到更新数据之前的位置
                    beforeScrollHeight = currentScrollHeight;// 更新beforeScrollHeight
                    progress = false;
                }
            });
            //用于最新到达的日志内容的获取
            socket.on('getNewLogText', function(data){
                
                scope.loadingPrevious = false;
                scope.loadingNew = false;
                if(scope.logs){
                    scope.logs = scope.logs.concat(data);
                }else{
                    scope.logs = data;
                }

                scope.$apply(); //更新view
                currentScrollHeight  =  $content[0].scrollHeight - 19; //减去padding值
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
            scope.loadingNew = false;
            scope.loadingClass = scope.loadingClass || 'log-loading';
            /***********end********/

            //建立socket连接
            if(scope.init){
                connectSocket(scope, el);
                scope.init = false;
            }
        }
    }]);
})();
