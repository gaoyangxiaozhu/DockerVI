var        Q = require('q');
var    async = require('async');
var    mysql = require('mysql');
var   config = require('../../config/env');



function PromiseDB(){
    this.connection = undefined;
}

PromiseDB.prototype = Object.create(null);


PromiseDB.prototype.connect = function(){
    this.connection = mysql.createConnection(config.mysql);

    var defer = Q.defer();
    this.connection.connect(defer.makeNodeResolver());
    return defer.promise;
};

PromiseDB.prototype.use = function(db){
    var defer = Q.defer();

    this.connection.query('USE ' + db, defer.makeNodeResolver());
    return defer.promise;
};

PromiseDB.prototype.query = function(sql){
    var defer = Q.defer();
    this.connection.query(sql, defer.makeNodeResolver());
    return defer.promise;
};

PromiseDB.prototype.end = function(){
    this.connection.end();
}

exports.PromiseDB = PromiseDB;
