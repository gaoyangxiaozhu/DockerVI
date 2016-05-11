'use strict';

var express = require('express');
var controller = require('./containers.controller');


var router = express.Router();

router.get('/getContainerList',controller.list);
router.get('/:id/getContainer', controller.details);
router.delete('/:id', controller.actions);
//stop or start
router.post('/:id/updateContainer', controller.actions);


module.exports = router;
