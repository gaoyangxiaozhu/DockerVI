'use strict';

// 生产环境配置
// =================================
module.exports = {
    port:     process.env.PORT || 8100,
    mongo: {
        suri: 'mongodb://0.0.0.0:32777/session-dev',
        options: {
            user:'user',          //生产环境用户名
            pass:'pass'           //生产环境密码
        }
    },
    mysql: {
        host: '0.0.0.0',
        port: '3333',
        user: 'root',
        password: '123123',
        db:'docker'
    }
};
