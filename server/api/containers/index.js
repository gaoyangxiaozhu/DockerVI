'use strict';

var express = require('express');
var controller = require('./containers.controller');

var timeout  = require('connect-timeout');

var router = express.Router();

router.get('/getContainerCount', controller.getContainerCount);
router.get('/getContainerList',controller.getContainerList);
router.get('/:id/getContainer', controller.getContainer);
router.get('/:id/getContainerStats', controller.getContainerStats);
//stop or start
router.post('/deleteContainer', controller.deleteContainer); //删除容器
router.post('/:id/updateContainer', controller.updateContainer);
router.post('/createContainer', timeout('6000s'), controller.createContainer);


module.exports = router;
