'use strict';

// 生产环境配置
// =================================
module.exports = {
    port:     process.env.PORT || 8100,
    mongo: {
        suri: 'mongodb://0.0.0.0:32777/session-dev',
    },
    mysql: {
        host: '0.0.0.0',
        port: '3333',
        user: 'root',
        password: '123123',
        db:'docker'
    }
};
