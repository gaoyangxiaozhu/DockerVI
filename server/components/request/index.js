/**
 * @description  实现一个简单的clientHttpRequest对象 主要是实现了data方法
 * 用于获取docker的实时日志流数据
 * @author gaoyangyang
 * @module using for request
 */
"use strict";
var http = require('http');
var util = require('util');
var EventEmitter = require('events');


function parseURL(url){
  var tmp = url.match(/(\w{2}\.\w{3}\.\w{3}\.\w{3}):(\w*)(.*)/);
  var hostname = tmp[1];
  var     port = parseInt(tmp[2]);
  var     path = tmp[3];
  return {
    hostname : hostname,
    port : port,
    path : path
  };
}

/********Docker request Objce Define for get Log ********/
function GRequest(){

  this.options={};
  //循环监听是否有新的数据到来的事件监听器的句柄
  this.timeHander = null;
  this.response = {}; //存储获取的数据
  this.exit = false;　  //是否退出监听当前的数据流
  this.hasError = false ; //是否发生错误
  return this;
}
GRequest.prototype = Object.create(null);

GRequest.prototype.get = function(url){
    this.options = parseURL(url);
    this.options.method = 'GET';
    //解析url以后返回this用于链式调用
    return this;
};

GRequest.prototype.data = function(cb){

  var that = this;

  /**
   * private function
   *
   * @return { function } 作为res data事件处理器
   */
  function _makeDataFunc(){
      var count = 0;
      function sendData(){
          //如果exit为True 说明当前http请求已经结束或者出错
          if(that.exit){
              that.exit = false;
            if(that.timeHander){
                clearInterval(that.timeHander);
                that.timeHander = null;
            }
            if(that.hasError){
                that.send(that.hasError, cb);
            }else{
                that.send(null, cb);
            }
        }else{
            //如果count >=2说明当前这一部分的数据流已经完全获取
            if(count >= 2){
                if(!that.response.text){
                    if(count >= 10){
                        count = 0;
                        that.send(null, cb); //如果连续10次为空　直接发送空内容
                    }
                }else{
                    count = 0;
                    that.send(null, cb);
                }
            }
            count++;
        }

      }
      //轮询监听函数　如果连续两次data获取的数据为空
      that.timeHander = setInterval(sendData, 500);

      //返回的用于绑定在res.data的事件处理函数　用于实时获取数据流
      return function(chunk){
        //获取新的数据并追加到response.text
        that.response.text = that.response.text ? that.response.text += chunk : chunk.toString();
        count = 0;

        return true;
      };
  }
  // http.request方法 返回一个clientRequest对象
  that.request = http.request(this.options, function(res){
      var err = false; // http请求是否出错
      that.timeHander = null;

      res.on('data', that.dataFunc);
      res.on('end', function(){
          //当前数据发送以后 当前请求就结束
          that.exit = true;
          return;
        });
      res.on('error', function(err){
          that.exit = true;
          that.hasError = err;
          return;
      });
  });

  that.request.on('error', function(err){
      that.exit = true;
      that.hasError = err;
      return;
  });
  that.request.on('socket', function(socket){
      that.dataFunc = _makeDataFunc();
  });

  that.request.end();
  //返回this
  return this;
};
//send函数　只有在需要数据发送时　或者当前数据流结束时(end事件触发)　或者发生err时调用
GRequest.prototype.send = function(err, cb){
    if(err){//如果发生err
      cb(err, this.response);
    }else{
      cb(null, this.response);
    }
    this.response = {};
    return;
};
GRequest.prototype.abort = function(){
    //TODO
    this.exit = true;
    this.response = {};

    if(this.globalReq){
        this.globalReq.abort(); //中断当前socket
        delete this.globalReq;
    }
};

module.exports = GRequest;
