'use strict';

// 生产环境配置
// =================================
module.exports = {
    port:     process.env.PORT || 8100,
    mysql: {
        host: '0.0.0.0',
        port: '3306',
        user: 'root',
        password: 'root',
        database:'docker'
    }
};
