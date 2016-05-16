/**
 * @description 实现服务器端推送事件 主要用于Docker Container内部日志的实时显示以及资源使用情况显示
 * @author gaoyangyang
 */
'use strict'

var                Q = require('q');
var            async = require('async');
var         GRequest = require('./components/request');
var         endpoint = require('./api/endpoint').SWARMADDRESS;
var          request = require('./components/superagent');

var promiseDockerLogReq = {};

var dockerLogRequest;
//将dockerLogRequest.get方法promise化
// promiseDockerLogReq.get = (function(){
//     var defer = Q.defer();
//
//     return function(url){
//         dockerLogRequest.get(url)
//         .data(defer.makeNodeResolver());
//         return defer.promise;
//     };
// })();


//socket 服务器监听在9000端口
var io = require('socket.io')(9000);

var parserRawLogText = function(rawLogText){

    rawLogText = rawLogText.replace(/[\u0000|\u0001]*\S*(?=\d{4}-\d{2}-\d{2}\w*)/g, '');
    var rawLogTextArray = rawLogText.split('\n'); //按行输出
    return rawLogTextArray;
};

function ContainerLog(socket, id){
    this.id = id;
    this.content = null;
    this.firstStream = true; //this.newContent 不使用第一次监听获取的数据
    this.socket = socket;
    this.content = []; //存放当前获取的日志内容（从当前时刻之前开始 按行存储）
    this.line = 0; //当前显示的行数
    this.newContent =[]; //存放新到达的日志的内容（从当前时刻之后 按行存储）
    this.endpoint = endpoint + '/containers/' + id + '/logs?stdout=1';
}
var container;
ContainerLog.prototype = Object.create(null);

//当前请求断开初始化事件
ContainerLog.prototype.initConnectBrokenFunc =  function(cb){
    //TODO
    dockerLogRequest.end(cb);
}
ContainerLog.prototype.sustainedConnectForNewLogText = function(timestamps){
    //对于当前日志已经存在的内容默认每次只获取一百行的数据 重新请求则从当前时间点开始获取数据
    var url = timestamps ? this.endpoint + '&follow=1&timestamps=' + timestamps : this.endpoint + '&follow=1&tail=100';
    //data时间 不停地监听获取当前的request请求的日志内容， 直到当前的请求中断或者数据已经完全获取，当前请求结束。
    var that = this;

    return dockerLogRequest.get(url)
           .data(function(err, response){

                //TODO
                if(err || !response.ok){
                    socket.emit('message', {'error_msg': 'error'});
                    return false;
                }
                //对获取的日志数据进行格式化处理
                var rawLogText = response.text;

                //返回格式化后的日志内容
                var rawLogTextArray = parserRawLogText(rawLogText);

                if(rawLogTextArray.length){

                    if(that.firstStream){
                        that.firstStream = false;
                        return;
                    }
                    that.newContent = that.newContent.concat(that.newContent, rawLogText);
                    //数据准备好 请求前端是否准备好接收新的日志内容
                    //如果前端准备好 如鼠标位于当前最低端 则emit sendNewLogText事件
                    that.socket.emit('getReadyForNewLogText');


                }
            });
};
ContainerLog.prototype.getLogContentByLine = function(){
    var that = this;

    if(this.line == 0){
        this.line = 2000;
    }

    var url = this.endpoint + '&tail=' + this.line;
    //获取日志内容以后返回promise对象
    return  request.get(url)
            .then(function(response){
                if(!response.ok){
                    throw new Error("error");
                }

                return response.text;

            }).then(function(rawLogText){
                //返回获取的数据集
                return parserRawLogText(rawLogText);
            }).fail(function(err){
                console.log(err);
            });
};

var dockerLog = io.of('/logs')
    .on('connection', function(socket){
        // 连接成功以后通知前端连接成功
        socket.emit('notice', 'OK');


        //前端获取连接成功的消息以后触发init事件 传递容器Id 以及容器状态 后端根据Id 和容器状态进行数据初始化工作以及开始监听
        socket.on('init', function(containerId, containerStatus){
            //生成新的container instance
            container = new ContainerLog(socket, containerId);
            //生成新的GRequest instance
            dockerLogRequest = new GRequest();

            container.getLogContentByLine()
            .then(function(rawLogTextArray){
                //container 内容初始化
                container.content = rawLogTextArray;
                container.line = 2000;
            })
            .then(function(){
                //发送最后100行日志内容到前端进行日志初始化渲染
                socket.emit('getContainerLogText', container.content.slice(-100), 'init');
                //从content中删除后100行数据

                container.content = container.content.slice(0, -100);
                //开启监听是否有新数据到达
                container.sustainedConnectForNewLogText();
                //初始化当前监听中断事件
                container.initConnectBrokenFunc(function(){
                    if(container.newContent.length){
                        //如果前端准备好 如鼠标位于当前最低端 则emit sendNewLogText事件
                        socket.emit('getReadyForNewLogText');
                    }
                });

            });
        });
        //前端重启服务以后触发remonitor事件 重新监听从当前时间点开始是否有新的数据到达
        socket.on('reMonitorForLogStartFromCurTime', function(){
            var timestamps = Math.round(new Date().getTime()/1000);
            container.sustainedConnectForNewLogText(timestamps);

        });
        socket.on('sendNewLogText', function(ready){
            //发送新数据到前端
            socket.emit('getNewLogText', container.newContent);
            container.newContent = [];
        });
        //前端 鼠标滚动到顶部 触发
        socket.on('getMoreLogContent', function(){

            if(container.content.length){
                //发送最后100行日志内容到前端进行日志初始化渲染
                socket.emit('getContainerLogText', container.content.slice(-100));

                if(container.content.length < 100){
                    //通知前端 日志内容已经获取完毕(不包括即将到来的新的日志内容)
                    socket.emit('notice', 'done');
                    container.content = [];
                }else{//从content中删除后100行数据
                    container.content = container.content.slice(0, -100);
                }
            }else{
                //重新获取2000行数据
                container.line = container.line + 2000;
                container.getLogContentByLine()
                .then(function(rawLogTextArray){
                    rawLogTextArray = rawLogTextArray || [];
                    if(rawLogTextArray.length == container.line){
                        //只保留最后的2000行
                        rawLogTextArray = rawLogTextArray.slice(0, -(container.line - 2000));
                    }else{
                        //移除已经显示过的数据
                        rawLogTextArray = rawLogTextArray.slice(0, -(rawLogTextArray.length - (container.line - 2000)));
                    }

                })
                .then(function(rawLogTextArray){
                    container.content = rawLogTextArray;
                    if(container.content.length === 0){
                        //通知前端 日志内容已经获取完毕(不包括即将到来的新的日志内容)
                        socket.emit('notice', 'done');
                        return ;
                    }
                    if(container.container.length){

                        if(container.content.length >= 100){
                            //发送最后100行日志内容到前端进行日志初始化渲染
                            socket.emit('getContainerLogText', container.content.slice(-100));
                            //从content中删除后100行数据
                            container.content = container.content.slice(0, -100);
                        }else{
                            //发送所有的日志内容
                            socket.emit('getContainerLogText', container.content);
                            container.content = [];
                            //通知前端 日志内容已经获取完毕(不包括即将到来的新的日志内容)
                            socket.emit('alreadyHaveAllContent', true);
                        }
                    }
                }).fail(function(err){
                    console.log(err);
                });
            }
        });
        socket.on('disconnect', function(){
            container = null;
            dockerLogRequest.abort();

        });

  });
