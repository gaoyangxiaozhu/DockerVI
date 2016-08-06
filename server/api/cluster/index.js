/**
*@app docker-visual
*@author gaoyangyang
*@description
* for get swarm cluster resource info
* equal curl http://<swarmip:swarmport>/info
*/

'use strict';

var request = require('superagent');
var express = require('express');
var endpoint = require('../endpoint').SWARMADDRESS;
var router = express.Router();

/**
 * @param {string} data
 * @param {int}
 */
function getUsedMemByByte(mem){
    var usedMem = parseInt(mem);
    var unit = mem.replace(/[0-9\s]*/, '');
    switch (unit.trim()){
        case 'B':
            return usedMem;
        case 'K':
        case 'KB':
        case 'Kb':
            return usedMem * 1000;
        case 'M':
        case 'MB':
        case 'MiB':
        case 'Mb':
            return usedMem * 1000 * 1000;
        case 'G':
        case 'GB':
        case 'Gb':
            return usedMem * 1000 * 1000 * 1000;

    }
}

/**
*格式化数据
*@param {Array} data
*@return {Object} ret
*/
function formatData(data){
  var containerNums = parseInt(data.Containers); //容器总个数
  var containerRunningNums = parseInt(data.ContainersRunning); //运行容器个数
  var containerPauseNums = parseInt(data.ContainersPaused); //暂停容器个数
  var containerStopNums = parseInt(data.ContainersStopped);// 停止容器个数
  var imageNums = parseInt(data.Images); //镜像总个数
  var opSystem = data.OperatingSystem; //操作系统

  var systemData = data.SystemStatus || data.DriverStatus; //兼容低版本docker engine
  var nodeArray = [];
  var nodes = parseInt(systemData[3][1]) + 1; //集群节点个数
  var healtynodes = nodes; //健康节点的个数

  var totalMemByGB = (parseInt(data.MemTotal) / 1000 / 1000 /1000).toFixed(2);//(GB)
  var totalMem = parseInt(data.MemTotal);
  var totalCpu = parseInt(data.NCPU);

  var totalUsedMem = 0;
  var totalUsedCpu = 0;
  var memUsedUnit = 'B';

  var _data = systemData.slice(4);

  var strategy = systemData[1][1]; //strategy

  for(var i = 0; i <= _data.length / 9 - 1; i++){
      var   name = _data[i * 9][0];
      var     ip = _data[i * 9][1];
      var status = _data[i * 9 + 1][1];
      var  cNums = _data[i * 9 + 2][1]; //部署的容器个数
      var    cpu = _data[i * 9 + 3][1].split('/');
      var    mem = _data[i * 9 + 4][1].split('/');

      var node = {
            name  : name,
              ip  : ip,
          status  : status,
           cNums  : cNums,
         cpu_use  : parseInt(cpu[0]),
         cpu_has  : parseInt(cpu[1]),
         mem_use  : mem[0],
         mem_has  : mem[1]
      };

      nodeArray.push(node);

      if(status.trim() != 'Healthy'){
          healtynodes = healtynodes - 1;
      }

      totalUsedMem += getUsedMemByByte(mem[0]);
      totalUsedCpu += parseInt(cpu[0]);

  }
  var ret = {
      opSystem : opSystem,
      strategy : strategy,
      nodes : nodes,
      healtynodes : healtynodes,
      totalCpu : totalCpu,
      totalMem : totalMem,
      totalUsedCpu : totalUsedCpu,
      totalUsedMem : totalUsedMem,
      totalMemByGB : totalMemByGB,
      memUsedUnit : memUsedUnit, //计算使用的内存的计量标志
      nodeArray : nodeArray,
      imageNums : imageNums,
      containerNums : containerNums,
      containerStopNums : containerStopNums,
      containerPauseNums : containerPauseNums,
      containerRunningNums : containerRunningNums,
  };
  return ret;
}
/**
 * [cluster description]
 * docker remote api http:<swarmip: swarmport>/info 接口
 * @param  {request Objcet} req
 * @param  {response Object} res
 * @return None
 */
function cluster(req, res){
  var url = endpoint + '/info';
  request
  .get(url)
  .end(function(err, response){
    if(err || !response.ok){
      res.send({'error_msg': 'do you has connect internet?'});
    }
    else{
        res.send(formatData(response.body));
    }
  });
}
module.exports = cluster;
