/**
 * @description 用于对集群中各个容器内部的资源使用情况的实时监控和存储
 * @author gaoyangyang
 */
var   mysql = require('mysql');
var config  = require('./config');
var request = require('./request');
var       Q = require('q');
var   async = require('async');

var      fs = require('fs');
var  logDir = config.logDir;

/**创建日志目录(如果不存在)***/
try {
     if(!fs.existsSync(logDir)){
         fs.mkdirSync(logDir);
     }
} catch (e) {
     fs.mkdirSync(logDir);
}

/**创建日志目录结束**/

function deleteLogFile(path){
    var timemap = Math.round(new Date().getTime() / 1000 / 3600 / 24);//天
    var files = [];
    if(fs.existsSync(path)){
        files = fs.readdirSync(path);//同步获取当前路径下的所有文件名称的数组对象
        files.forEach(function(file, index){
        var curPath = path + "/" + file;
        if(fs.statSync(curPath).isDirectory()) { // recurse
            deleteLogFile(curPath);
        }else{
            // 删除过期文件
            var curTimemap = parseInt(file.split('_')[4].replace(/\.log/, ''));

            if((timemap - curTimemap) > 7){
                fs.unlinkSync(curPath); //删除文件
            }

        }
      });
  }
}



//日志功能 记录每天的运行日志 只保留最近7天的日志文件
var  logger = require('tracer').colorConsole({
    transport : function(data) {
        console.log(data.output);
        var tStr = parseDate(new Date()).replace(/-/g, '_');
        var timemap = Math.round(new Date().getTime() / 1000 / 3600 / 24);//天
        var logFilePath = './log/file_' + tStr + '_' + timemap + '.log';
        fs.appendFile(logFilePath, data.output + '\n', function(err){
            if (err) throw err;
        });
    }
});


var mysqlConfig = config.mysql;
var endpoint = config.swarm_add;
var dbname = config.dbname || 'docker';

Q.longStackSupport = true;
//连接数据库
var connection = mysql.createConnection(mysqlConfig);


//根据配置文件创建并使用当前数据库
function createAndConnectDB(){
    var defer = Q.defer();

    connection.query("CREATE DATABASE IF NOT EXISTS " + dbname, function(err, results){
        if(err){
            logger.error(err.message);
        }
        //数据库创建成功以后使用当前数据库
        connection.query('USE ' + dbname, defer.makeNodeResolver());

    });

    return defer.promise;

}
/*****************************主功能************************************/

var getContainerListUrl = endpoint + '/containers/json?all=1';

function inspectContainerMsg(id){
    var url = endpoint + 'containers/' + id + '/json';
    return  request.get(url)
            .then(function(res){
              if(!res.ok){
                  throw new Error("error");
              }

              return res.body;
            })
            .fail(function(err){
                logger.error(err.message);
              });
}
function getContainerStatus(id){

    return  inspectContainerMsg(id)
            .then(function(data){
                var status = data.State.Status;
                return status;
            })
            .fail(function(err){
                logger.error(err.message);
              });
}
//格式化时间　yyyy-mm-dd
function parseDate(date, accurate){

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
//格式化资源数据
function parseStats(data){

    var parseData = {};
    parseData.cpu_usage = data.cpu_stats.cpu_usage.total_usage;
    parseData.system_cpu_usage = data.cpu_stats.system_cpu_usage;
    parseData.mem_limit = data.memory_stats.limit / 1000 / 1000 / 1000; //(GB) //docker在计算内存利用率时，进行单位转换是按国际标准1000进行转换
    parseData.mem_usage = data.memory_stats.usage / 1000 / 1000 / 1000; //(GB)
    parseData.rx_bytes = data.networks.eth0.rx_bytes; //(B)
    parseData.tx_bytes = data.networks.eth0.tx_bytes; //(B)
    parseData.read_time =　new Date(data.read);

    parseData.cpu_num = data.cpu_stats.cpu_usage.percpu_usage.length; //cpu核数

    return parseData;

}
/**
 * 用于为当前运行容器获取两个不同时刻的资源实例数据　以Promise对象的形式返回
 * 其中Promise携带的value值（即传递给fulfile　function的参数）为一个由两个资源数据对象组成的数组[Object, Object]
 * @param  {String} id 容器id
 * @return {Promise}    返回Promise对象　用于接下来对资源当前时刻资源利用率的计算
 */
function getResourceStatsForRunContainer(id){
    var url = endpoint + 'containers/' + id + '/stats?stream=0';
    var defer = Q.defer();

    async.series([
        function(callback){

            request.get(url)
            .then(function(res){
              if(!res.ok){
                  callback('error', null);
              }
              callback(null, res.body);
            })
            .fail(function(err){
                callback(err.message, null);
              });
        },
       function(callback){

           request.get(url)
           .then(function(res){
             if(!res.ok){
                 callback('error', null);
             }

             callback(null, res.body);
           })
           .fail(function(err){
               callback(err.message, null);
             });

       }
    ],
    //callback
    defer.makeNodeResolver()
  );

  return defer.promise;

}

/**
 * 当数据库表格创建成功后通过此函数开始进行实际的资源监控工作
 * @param  {String} container 容器名称
 * @param  {tableName} tableName 容器对应的数据库表
 * @return {Promise}           Promise对象
 */
function doWork(container, tableName){

    var sql;

    return  getContainerStatus(container.id) //容器运行状况
            .then(function(status){
                if(status != 'running'){//如果容器当前没有运行
                    sql = 'INSERT INTO ' + tableName + ' (cpu_percent, mem_percent, mem_limit, mem_usage, rx_bytes, tx_bytes, read_time) ' + 'VALUES' +
                    '(' +
                    '0.00' + ',0.00' + ',0.00' + ',0.00' + ',0.00' + ',0.00,' +
                    '"' + parseDate(new Date(), true) + '"' +
                    ')';
                    connection.query(sql, function(err, results){
                    if(err){
                        logger.error(err.message);
                    }
                });
              }else{ //如果容器运行
                  getResourceStatsForRunContainer(container.id)
                  .then(function(results){

                      var oldStatsData = parseStats(results[0]);
                      var newStatsData = parseStats(results[1]);

                      //两次读取数据的时间差
                      var timeDelta = Math.round((newStatsData.read_time - oldStatsData.read_time)/1000);

                      var cpuPercent = Math.abs(newStatsData.cpu_usage/timeDelta - oldStatsData.cpu_usage/timeDelta ) / Math.abs(newStatsData.system_cpu_usage/timeDelta - oldStatsData.system_cpu_usage/timeDelta)　* newStatsData.cpu_num * 100;
                      cpuPercent = parseFloat(cpuPercent.toFixed(2));

                      var memPercent = newStatsData.mem_usage / newStatsData.mem_limit * 100;
                      memPercent = parseFloat(memPercent.toFixed(2));

                      var memLimit = newStatsData.mem_limit;
                      var memUsage = newStatsData.mem_usage;

                      var rxBytes = newStatsData.rx_bytes;
                      var txBytes = newStatsData.tx_bytes;

                      var readTime = parseDate(newStatsData.read_time, true);

                      var dbData={
                          cpu_percent : cpuPercent,
                          mem_percent : memPercent,
                          mem_limit : memLimit,
                          mem_usage : memUsage,
                          rx_bytes : rxBytes,
                          tx_bytes : txBytes,
                          read_time : readTime
                      };

                      //存入数据库
                      connection.query('INSERT INTO ' + tableName + ' SET ?', dbData, function(err, results){
                          if(err){

                              throw new Error(err);
                          }

                      });

                  }).fail(function(err){
                      logger.error(err.message);

                  }).done();

              }
            });

}
function startMonitor(co, currentTime, oldTime){
    var newTableName = [co.name, currentTime].join("_").replace(/-/g, '_');
    var oldTableName = [co.name, oldTime].join("_").replace(/-/g, '_');

    //删除２４小时之前的表
    connection.query("DROP TABLE IF EXISTS " + oldTableName, function(err, results){
        if(err){
            logger.error(message);
        }

    });

    //创建新表(如果不存在的话)
    var createSql = "CREATE TABLE IF NOT EXISTS " +
                        newTableName +
                        "(" +
                        "id int NOT NULL AUTO_INCREMENT," +
                        "cpu_percent DOUBLE(5,2) NOT NULL," +
                        "mem_percent DOUBLE(5,2) NOT NULL," +
                        "mem_limit DOUBLE NOT NULL," +
                        "mem_usage DOUBLE NOT NULL," +
                        "rx_bytes DOUBLE NOT NULL," +
                        "tx_bytes DOUBLE NOT NULL," +
                        'read_time datetime NOT NULL,' +
                        "PRIMARY KEY(id)" +
                        ")";
    connection.query(createSql, function(err, results){
      if(err){
          logger.error(err.message);
      }

      //开始监控
      doWork(co, newTableName);

    });
}
//入口函数
function main(){

  //获取容器列表
  request.get(getContainerListUrl)
  .then(function(res){
      if(!res.ok){
          throw new Error("error");
      }
      var data = res.body;

      var containerArray = [];
      data.forEach(function(item, index){

          var id = item.Id;
          var name = item.Names[0].replace(/^\//,"").split('/').join('_');
          containerArray.push({id:id, name: name});
      });
      return containerArray;
  })
  .then(function(containerArray){

        var date = new Date();
        var currentTime = parseDate(date);
        date.setDate(date.getDate() - 2);
        var oldTime = parseDate(date);


        //遍历容器列表
        for(var i in containerArray){
            var currentCo = containerArray[i];
            //开始监控
            startMonitor(currentCo, currentTime, oldTime);
        }
        return ;

  })
  .fail(function(err){
      logger.error(err.message);
  })
  .done();
}

var timeHander;

//循环运行主函数
function runingMainForever(){

  async.forever(function (next) {
      //删除过期日志
      deleteLogFile(logDir);
      main();
      timeHander = setTimeout(next, 300000); //５分钟插入一次数据
  },
  function(stop){
      if(timeHander){
          clearTimeout(timeHander);
      }
      logger.info('quit program');
      connection.end();//关闭数据库
      return ;
  });
}

/**
 * 入口函数
 * 每次重新运行脚本都会先运行此函数，函数用于创建用于存储资源数据的数据库(如果不存在的话)并使用当前数据库(USE database)
 * 在返回的promise对象的fulfile方法中运行runingMainForever函数开始资源监控和存储
 * @return {promise对象}　用于数据库连接成功后的后续动作
 */
createAndConnectDB()
.then(function(){
    //创建成功以后运行主函数
    logger.info('use database %s successfully...', dbname);

    logger.info('start monitor...');
    runingMainForever();

}).fail(function(err){
    logger.error(err.message);
}).done();
