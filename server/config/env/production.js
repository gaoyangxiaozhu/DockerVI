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
        uri: 'mongodb://10.103.242.167:27000/docker-pro'
    },
    seedDB: true
};
