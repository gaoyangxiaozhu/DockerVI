'use strict';

// 测试环境配置
// ===========================
module.exports = {
  mongo: {
    suri: 'mongodb://localhost/docker-test'
  },
  port:    process.env.PORT || 8080,
  seedDB: true
};
