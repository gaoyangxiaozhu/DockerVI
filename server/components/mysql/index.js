var        Q = require('q');
var    async = require('async');
var    mysql = require('mysql');
var   config = require('../../config/env');


function PromiseDB(){
    this.connection = undefined;
    this.tryCount = 0; //尝试连接数据库的次数　
    this.maxTry = 30; //默认最多尝试连接30次
}

PromiseDB.prototype = Object.create(null);


PromiseDB.prototype.connect = function(cb){
    if(!cb || Object.prototype.toString.call(cb) != '[object Function]'){
        throw Error("cb show be function.");
    }
    var that = this;
    var data;
    that.connection = mysql.createConnection(config.mysql);
    that.connection.connect(function(err){
        if(err){
            console.log('error when connecting to db: ', err);
            //We introduce a delay before attempting to reconnect,
            //to avoid a hot loop, and to allow our node script to
            //process asynchronous requests in the meantime.
            // If you're also serving http, display a 503 error.
            that.tryCount++;
            if(that.tryCount > that.maxTry){
                //说明可能服务器没有开启或者deploy_db服务出错
                cb(err);
                that.tryCount = 0;
            }else{
                //重新尝试连接数据库
                setTimeout(that.connect, 2000);
            }

        }else{
            //connect success
            cb();
            //set error handler
            // Connection to the MySQL server is usually
            // lost due to either server restart, or a
            // connection idle timeout (the wait_timeout
            // server variable configures this)
            that.connection.on('error', function(err) {
              console.log('db error', err);
              if(err.code === 'PROTOCOL_CONNECTION_LOST') {
                console.log('try reconnect mysql..');
                if(that.onError && Object.prototype.toString.call(that.onError) == '[object Function]'){
                    that.connect(function(err){
                        if(err){
                            that.onError();
                        }
                    });
                }
              } else {
                throw err;
              }
            });
        }
    });
};

PromiseDB.prototype.use = function(db){
    var that = this;
    var defer = Q.defer();

    that.connection.query('USE ' + db, defer.makeNodeResolver());
    return defer.promise;
};

PromiseDB.prototype.query = function(sql){
    var that =this;
    var defer = Q.defer();
    that.connection.query(sql, defer.makeNodeResolver());
    return defer.promise;
};
PromiseDB.prototype.end = function(){
    var that = this;
    if(that.connection){
        that.connection.end();
    }
};
PromiseDB.prototype.onError = function(){};
exports.PromiseDB = PromiseDB;
