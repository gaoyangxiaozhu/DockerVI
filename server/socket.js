
/**
 * @description 实现服务器端推送事件 主要用于Docker Container内部日志的实时显示
 * @author gaoyangyang
 */
'use strict';


var                Q = require('q');
var            async = require('async');
var         GRequest = require('./components/request');
var            tools = require('./components/tools');
var           config = require('./config/env');
var        PromiseDB = require('./components/mysql').PromiseDB;
var         endpoint = require('./api/endpoint').SWARMADDRESS;
var          request = require('./components/superagent');

var promiseDockerLogReq = {};

var dockerLogRequest;
var io;

//格式化时间　yyyy-mm-dd
function formatTime(date, accurate){

    var    year  = date.getFullYear();
    var   month  = parseInt(date.getMonth()) + 1 < 10 ? '0' + parseInt(date.getMonth() + 1)  : parseInt(date.getMonth() + 1);
    var     day  = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    var   hours  = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    var minutes  = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    var  second  = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    if(accurate){
        return [[year, month, day].join("-"), [hours, minutes, second].join(':')].join(' ');
    }
    return [year, month, day].join("-");
}
/**
 * for parse container log
 * @param {String} rawLogText - The raw container logs get by using remote api
 */
//TODO 主要用于格式化获取的容器日志内容用于前端显示　获取的原始的日志内容的每一行开头总是出现乱码 \u0000\u0001　以及其他一些不必要的符号等　
//目前的处理方法只是简单的去掉\u0000或者\u0001并从第2个字母开始截取每一行内容　可能会出现把正确的需要显示的第二个字符截取掉　需要改进
var parserRawLogText = function(rawLogText){
    if(!rawLogText){
        return [];
    }
    var rawLogTextArray = rawLogText.split('\n'); //按行输出
    var logs = [];
    rawLogTextArray.forEach(function(item, index){

        var log = {};
        log.time = undefined;
        if(/\d{4}-\d{2}-\d{2}\w*/.test(item)){

            item = String(item).replace(/[\u0000|\u0001]*\S*(?=\d{4}-\d{2}-\d{2}\w*)/g, '');

            log.time = formatTime(new Date(item.match(/\d{4}-\d{2}-\d{2}[\w|:|+|\.]*Z\b/)[0]), true);
            log.message = item;

        }else{
            item = item.replace(/[\u0000|\u0001]*/g, '');
            log.message = item.slice(1);
        }
        log.message.replace(/^\s*/,'');
        if(log.message){
            if(!log.time){
                delete log.time;
            }
            logs.push(log);
        }
    });
    return logs;
};

function ContainerLog(socket, id){
    this.id = id;
    this.content = null;
    this.firstStream = true; //this.newContent 不使用第一次监听获取的数据
    this.socket = socket;
    this.content = []; //存放当前获取的日志内容（从当前时刻之前开始 按行存储）
    this.line = 0; //当前显示的行数
    this.newContent =[]; //存放新到达的日志的内容（从当前时刻之后 按行存储）
    this.endpoint = endpoint + '/containers/' + id + '/logs?stdout=1&timestamps=1';
}

var container;

ContainerLog.prototype = Object.create(null);

//当前请求断开初始化事件
ContainerLog.prototype.initConnectBrokenFunc =  function(cb){
    //TODO
    dockerLogRequest.end(cb);
};
ContainerLog.prototype.sustainedConnectForNewLogText = function(timestamps){
    /**
     * 对于新到达的数据从当前时间点开始获取
    **/
    var url =  this.endpoint + '&follow=1&since=' + timestamps;
    //data时间 不停地监听获取当前的request请求的日志内容， 直到当前的请求中断或者数据已经完全获取，当前请求结束。
    var that = this;
    //生成新的GRequest instance
    if(dockerLogRequest){
        dockerLogRequest = null;
    }

    dockerLogRequest = new GRequest();
    console.log(url);

    return dockerLogRequest.get(url)
           .data(function(err, response){
                //TODO
                if(err){
                    //code 为通知码　　０表示获取内容为空 １表示出错 2表示连接接连
                    that.socket.emit('message', { code: 1, msg: err.message, rror_msg : err.message, status: err.status || response.status });
                    return false;
                }

                var rawLogText = response.text;

                //返回格式化后的日志内容
                var rawLogTextArray = parserRawLogText(rawLogText);

                if(rawLogTextArray.length){//如果获取的数据不为空

                    that.newContent = that.newContent.concat(that.newContent, rawLogTextArray);
                    //更新当前已经存在的日志内容的最后一条的时间戳
                    container.timestamps = (new Date(that.newContent[that.newContent.length - 1].time).getTime() / 1000) + 1;

                    //数据准备好 请求前端是否准备好接收新的日志内容
                    //如果前端准备好 如鼠标位于当前最低端 则emit sendNewLogText事件
                    that.socket.emit('getReadyForNewLogText');

                }else{//如果获取内容为空
                    that.socket.emit('message', {code: 0, msg: 'content is emptry.'});
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

module.exports = function(port){
    io = require('socket.io')(port);
    /******* start 建立socket连接　用于容器日志的实时刷新显示　start ****/
    var dockerLog = io.of('/logs')
        .on('connection', function(socket){
            // 连接成功以后通知前端连接成功
            console.log('connection !');
            socket.emit('notice', 'OK');

            //前端获取连接成功的消息以后触发init事件 传递容器Id 以及容器状态 后端根据Id 和容器状态进行数据初始化工作以及开始监听
            socket.on('init', function(containerId, containerStatus){
                //生成新的container instance
                console.log('init');
                container = new ContainerLog(socket, containerId);

                container.getLogContentByLine()
                .then(function(rawLogTextArray){
                    //container 内容初始化
                    if(rawLogTextArray.length == 0){
                        //没有日志
                        container.content = [];
                        //获取当前已经存在的日志内容的最后一条的时间戳
                        container.timestamps = (new Date().getTime() / 1000);

                        return;
                    }
                    container.content = rawLogTextArray;

                    container.line = 2000;
                    //获取当前已经存在的日志内容的最后一条的时间戳
                    container.timestamps = (new Date(container.content[container.content.length - 1].time).getTime() / 1000) + 1;
                })
                .then(function(){
                    //发送最后100行日志内容到前端进行日志初始化渲染
                    if(container.content.length == 0 ){
                        socket.emit('getContainerLogText', [], 'init');
                    }else{
                        socket.emit('getContainerLogText', container.content.slice(-100), 'init');
                        //从content中删除后100行数据
                        container.content = container.content.slice(0, -100);
                    }

                    if(containerStatus == 'running'){
                        //开启监听是否有新数据到达
                        container.sustainedConnectForNewLogText(container.timestamps);
                    }
                    //初始化当前监听中断事件
                    container.initConnectBrokenFunc(function(){
                        if(container.newContent && container.newContent.length){
                            //如果前端准备好 如鼠标位于当前最低端 则emit sendNewLogText事件
                            socket.emit('getReadyForNewLogText');
                        }
                    });

                });
            });
            //前端重启服务以后触发remonitor事件 重新监听从当前时间点开始是否有新的数据到达
            socket.on('reMonitorForLogStartFromCurTime', function(){
                container.sustainedConnectForNewLogText(container.timestamps);

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
                            rawLogTextArray = rawLogTextArray.slice(0, 2000 - container.line );
                        }else{
                            //移除已经显示过的数据
                            rawLogTextArray = rawLogTextArray.slice(0, - container.line);
                        }
                        return rawLogTextArray;

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
                console.log('log socket disconnect');
                if(dockerLogRequest instanceof GRequest){
                    dockerLogRequest.abort();
                    console.log('log socket disconnect end');
                }
            });
            socket.on('error', function(err){
                console.log(err);
                console.log('log socket error');
            })

      });
    /******* end 建立socket连接　用于容器日志的实时刷新显示　end ****/

    /******* start 建立socket连接　用于容器内资源使用情况的实时刷新显示　start ****/
    function getSendContainerStatsFunc(DB, promiseDB){
        //通过在外部进行promiseDB.connect接连建立DB　instance 避免内部连接connect 导致的连接过多的错误
        return function _sendContainerStats(node, id, socket, init){
                var currentTime = formatTime(new Date());
                var currentLogTbName = [node, id, currentTime].join("_").replace(/-/g, '_');

                //TODO　用于测试　记得删除
                // currentLogTbName = 'node5_mongo_test_2016_05_07';

                DB.then(function(){
                    return promiseDB.use('information_schema');
                }).then(function(){
                    var sql = 'SELECT count(*) FROM TABLES WHERE table_name="' + currentLogTbName + '";'
                    return promiseDB.query(sql);
                }).then(function(results){
                    //用于判断数据库中是否存在当然容器当天的资源数据表
                    var count = results[0][0]['count(*)'];
                    return count;
                }).then(function(count){
                   //当前容器当天没有对应的资源数据库表
                    if(parseInt(count) === 0){
                        socket.emit('getContainerStats', {});
                        promiseDB.end();
                    }else{
                        return promiseDB.use(config.mysql.database);
                    }
                }).then(function(result){
                    if(result && Object.prototype.toString.call(result) == '[object Array]' && 'serverStatus' in result[0]){
                        var sql;
                        if(init){
                            //初始化用所有当天表格现有的数据
                            sql = 'SELECT * FROM ' + currentLogTbName;
                        }else{
                            //以后每时间间隔只读取最后一条记录(时间间隔要和docker_monitor存储数据的时间间隔保持一致)
                            sql = 'SELECT * FROM ' + currentLogTbName + ' order by id DESC limit 1';
                        }
                        return promiseDB.query(sql);
                    }
                }).then(function(results){
                    if(results && Object.prototype.toString.call(results) == '[object Array]'){
                        var data = results[0];

                        var cpuList = [], memList = [], rxList = [], txList = [], tmList = [];
                        data.forEach(function(item, index){
                            cpuList.push(item.cpu_percent);
                            memList.push(item.mem_usage.toFixed(3));
                            rxList.push(item.rx_bytes);
                            txList.push(item.tx_bytes);
                            tmList.push(formatTime(new Date(item.read_time), true));
                        });

                        var resources = {
                            cpu : cpuList,
                            mem : memList,
                            rx  : rxList,
                            tx  : txList,
                            tm  : tmList
                        };
                        if(init){
                            socket.emit('getContainerStats', resources, true);
                        }else{
                            socket.emit('getContainerStats', resources);
                        }
                }
            }).fail(function(err){
                console.log('Database operation error');
                socket.emit('notice', err.message);
                promiseDB.end();
            }).done();
        };
    }

    var dockerResource = io.of('/resources')
            .on('connection', function(socket){
                var timeHander;
                // 连接成功以后通知前端连接成功
                console.log('connet resource');
                socket.emit('notice', 'OK');
                //前端获取连接成功的消息以后触发init事件 传递容器Id 以及容器状态 后端根据Id 和容器状态进行数据初始化工作以及开始监听
                socket.on('init', function(node, containerId){
                    var promiseDB = new  PromiseDB();
                    var sendContainerStats = getSendContainerStatsFunc(promiseDB.connect(), promiseDB);

                    sendContainerStats(node, containerId, socket, true);
                });
                socket.on('sendResourceData', function(node, containerId){
                    var promiseDB = new  PromiseDB();
                    var sendContainerStats = getSendContainerStatsFunc(promiseDB.connect(), promiseDB);

                    async.forever(function (next) {
                        sendContainerStats(node, containerId, socket);
                        timeHander = setTimeout(next, 6000); //５分钟插入一次数据
                      },
                      function(stop){
                          if(timeHander){
                              clearTimeout(timeHander);
                          }
                          return ;
                      }
                  );

              });
        　　　　socket.on('disconnect', function(){
                    console.log('resources socket disconnect');
            　　});
              socket.on('err', function(err){
                  console.log(err);
              });
            });
    /**********end 建立socket连接　用于容器内资源使用情况的实时刷新显示　end **********/

    /*********start 建立socket连接　用于容器的创建　end ***************/
    var dockerCreateContainer = io.of('/newCon')
    .on('connection', function(socket){
        //code 为通知码　　０表示获取内容为空 １表示出错 2表示连接接连 3 表示当前操作成功
        socket.emit('message', { code:　2, msg: 'ok' });
        socket.on('createContainer', function(postData){
            if(postData && Object.prototype.toString.call(postData) === '[object Object]'){
                var data = postData;
                var url = endpoint + '/containers/create?name=' + data.Name;


                delete data.Name;
                if(tools.isNullObj(data.HostConfig.PortBindings)) delete data.HostConfig.PortBindings;
                if(tools.isNullObj(data.ExposedPorts)) delete data.ExposedPorts;

                request.post(url, data)
                .then(function(response){
                    if(!response.ok){
                        throw new Error('error');
                    }else{
                        socket.emit('message', { code : 3, msg : 'ok'});
                    }
                }).fail(function(err){
                    if('response' in err && err.response.text && /Network timed out/.test(err.response.text)){
                        err.message ='网络连接超时';

                    }else{
                        if(err.status == 409 && /Conflict/.test(err.message)){
                            //TODO bug
                            err.message = '容器命名冲突(Conflict)';
                        }else{
                            err.message +='(未知的错误)';
                        }
                    }
                    socket.emit('message', { code : 1, msg : 'error', error_msg : err.message, status: err.status || 500 });
            	});
            }


        });
    });
    /*********end 建立socket连接　用于容器的创建　end *****************/
};
