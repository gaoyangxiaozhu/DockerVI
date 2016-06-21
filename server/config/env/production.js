'use strict';

// 生产环境配置
// =================================
module.exports = {
    port:     process.env.PORT || 8100,
    mysql: {
        host: '0.0.0.0',
        port: '3333',
        user: 'root',
        password: '123123',
        database:'docker'
    }
};
