var agent = require('superagent');
var     Q = require('q');
function Request(){}
//get function
Request.prototype.get = function(url){
    var defer = Q.defer();
    agent
    .get(url)
    .end(defer.makeNodeResolver());

    return defer.promise;
};
//post function
Request.prototype.post = function(url, data){
    var defer = Q.defer();
    if(data.length){
        agent
        .post(url)
        .send(data)
        .end(defer.makeNodeResolver());
    }else{
        agent
        .post(url)
        .end(defer.makeNodeResolver());
    }

    return defer.promise;
};
//del function
Request.prototype.del = function(url){
  var defer = Q.defer();
  agent
  .del(url)
  .end(defer.makeNodeResolver());
  return defer.promise;

};
module.exports = new Request();
