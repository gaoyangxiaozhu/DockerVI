'use strict';

// 生产环境配置
// =================================
module.exports = {
    port:     process.env.PORT || 8100,
    mysql: {
        host: 'db',
        port: '3306',
        user: 'root',
        password: 'root',
        database:'docker'
    },
    mongo: {
        uri: 'mongodb://localhost/docker-pro',
        options: {
            user:'root',          //生产环境用户名
            pass:'root'           //生产环境密码
    }
  }
};
