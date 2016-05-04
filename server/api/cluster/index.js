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
*[formatData description]
*格式化数据
*@param {Array} data
*@return {Object} ret
*/
function formatData(data){

  var containerNums = parseInt(data.Containers); //容器总个数
  var imageNums = parseInt(data.Images); //镜像总个数
  var opSystem = data.OperatingSystem; //操作系统

  var systemData = data.SystemStatus;
  var nodeArray = [];
  var nodes = parseInt(systemData[3][1]) + 1; //集群节点个数


  var _data = systemData.slice(4);

  var strategy = _data[1][1]; //strategy

  for(var i = 0; i < _data.length / 9 - 1; i++){
      var   name = _data[i * 9][0];
      var     ip = _data[i * 9][1];
      var status = _data[i * 9 + 1][1];
      var  cNums = _data[i * 9 + 2][1];
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
  }
  var ret = {
        imageNums : imageNums,
    containerNums : containerNums,
         opSystem : opSystem,
         strategy : strategy,
            nodes : nodes,
        nodeArray : nodeArray
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
  .end(function(err, request){
    if(err || !request.ok){
      res.send({'error_msg': 'error'});
    }
    res.send(formatData(request.body));
  });
}
module.exports = cluster;
