(function () {
	'use strict';
	angular.module('dockerApp.service')
    .factory('CreateCon', function(){

        var createNewCon = function(postData, cb){
            cb = cb || angular.noop;
            
            var socket = io.connect('http://localhost:9090/newCon');
            socket.on('message', function(data){
                if(data){
                    //code 为通知码　　０表示获取内容为空 １表示出错 2表示连接接连 3表示当前请求动作成功完成
                    switch (data.code) {
                        case 0 :
                            break;
                        case 1 :
                            cb(data);
                            break;
                        case 2:
                            socket.emit('createContainer', postData);
                            break;
                        case 3:
                            cb(null, data);
                            break;
                        default:

                    }
                }
            });
        };
        return {
            createContainer : createNewCon
        };
    });
})();
