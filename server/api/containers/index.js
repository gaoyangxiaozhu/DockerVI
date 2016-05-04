'use strict';

var express = require('express');
var controller = require('./containers.controller');


var router = express.Router();

router.get('/list',controller.list);
router.get('/details/:id', controller.details);

//action = delete, start, stop, restart
router.get(/do\/(stop|start|delete)\/\w{1,}\/?$/, controller.actions);
router.post(/do\/(stop|start|delete)\/\w{1,}\/?$/, controller.actions);


module.exports = router;
