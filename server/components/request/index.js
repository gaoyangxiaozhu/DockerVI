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

var globalReq = null;

function GRequest(){

  this.options={};
  this.res = {};
  //循环监听是否有新的数据到来的事件监听器的句柄
  this.timeHander = null;
  this.response = {}; //存储获取的数据
  //是否退出监听当前的数据流
  this.exit = false;
  this._abort = false; //是否强制中断请求 用于离开页面时
  //当前是否是最后的数据流 即当前数据发送以后请求就会结束
  this.fin = false;
  EventEmitter.call(this);

  return this;
}

util.inherits(GRequest, EventEmitter);


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

GRequest.prototype.get = function(url){
    this.options = parseURL(url);
    this.options.method = 'GET';

    //解析url以后返回this用于链式调用
    return this;
};

GRequest.prototype.data = function(cb){

  var that = this;

  // http.request方法 返回一个clientRequest对象
  globalReq = http.request(this.options, function(res){
      var err = false; // http请求是否出错
      that.res = res;
      /**
       * [makeDataFun description]
       * @return { function } 返回一个函数 作为res data事件处理器
       */
      function makeDataFunc(){
          var count = 0;
          function sendData(){
              //如果exit为True 说明当前http请求已经结束
              if(that.exit){
                  that.exit = false;
                if(that.timeHander){
                    console.log('exit clearInterval');
                    clearInterval(that.timeHander);
                    that.timeHander = null;
                }
                return false;
              }
              //如果count >=2 并且response.ok 说明当前这一部分的数据流已经完全获取 执行回调函数返回给调用者
              if(count >= 2 && that.response.ok){
                  count = 0;
                  if(that.response.text){
                        that.send(null, cb);
                  }
              }

              count++;
             
              that.response.ok = true;
          }
          if(!that.timeHander){
              that.timeHander = setInterval(sendData, 500);
          }

          return function(chunk){
            if(err){//如果出错 停止循环调用
                that.send(err, cb);
                return false;
            }
            //获取新的数据并追加到response.text
            console.log(chunk);
            that.response.text = that.response.text ? that.response.text += chunk : chunk.toString();
            console.log(chunk.toString());
            console.log("count = " + count);

            count = 0;
            that.response.ok = false;

            return true;
          };
      }

      res.on('data', makeDataFunc());
      res.on('end', function(){
          console.log('end hahahahah');
          if(that.timeHander){
              console.log('end clearInterval');
              clearInterval(that.timeHander);
              that.timeHander = null;
          }
          //当前数据发送以后 当前请求就结束
          that.fin = that.response.fin = true;
          that.exit = true;

          if(that._abort){
              that.send(null, cb, 'abort');
          }else{
              that.send(null, cb, 'end');
          }

          return false;
        });
      res.on('error', function(err){
          console.log('error happen');
          console.log(err);
          that.fin = that.response.fin = true;
          that.exit = true;

          that.send(err.message, cb);
      });
  });


  globalReq.on('error', function(err){
      that.fin = that.response.fin = true;
      that.send(err.message, cb);
      return false;
  });

  globalReq.end();
  //返回this
  return this;
};

GRequest.prototype.send = function(err, cb){
    //TODO
    var option; //end or abort
    if(arguments.length > 2){
        option = arguments[2];
    }
    if(err){
      this.exit = true;
      if(this.timeHander){
         console.log('send clearInterval');
        clearInterval(this.timeHander);
        that.timeHander = null;
      }
      this.response.ok = false;
      this.fin = this.response.fin = true;
      cb(err, this.response);
      this.response = {};
    }else{
      if(this.exit){
        this.fin = this.response.fin = true;
      }
      if(this.response.text){
          //ok可能为false 因此在这里给重新赋值为true
          this.response.ok = true;

          cb(null, this.response);
      }
      this.response = {};
    }

    //请求结束 执行end回调
    if(err || option || this.exit || this.fin ){
        //TODO 可以对end事件传递参数
        if(option && option == 'abort'){
            this.end(true);
        }
        else {
            this.end(false);
        }
    }

    return true;
};
GRequest.prototype.end = function(cb){
    //end事件只有在that.exit为true的时候触发
    return function(){
      var option;
      var arg;
      if(arguments.length > 0){
        arg = Array.prototype.slice.call(arguments, 0);
        option = arg[0];
      }
      if(option){
        //如果为true 说明触发源 为 abort 事件
        cb(null, {type: 'abort'});
      }else{
        //否则为 res.end事件
        cb(null, {type: 'end'});
      }
    };
};
GRequest.prototype.abort = function(){
    //TODO
    this.exit = true;
    if(this.timeHander){
      clearInterval(this.timeHander);
      this.timeHander = null;
    }
    this.response = {};
    this._abort = true;

    if(globalReq){
        globalReq.abort();
    }

    this.res = null;
};

module.exports = GRequest;
