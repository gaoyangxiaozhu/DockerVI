'use strict';

var express = require('express');
var controller = require('./containers.controller');


var router = express.Router();

router.get('/getContainerList',controller.getContainerList);
router.get('/:id/getContainer', controller.getContainer);
router.delete('/:id', controller.deleteContainer);
//stop or start
router.post('/:id/updateContainer', controller.updateContainer);


module.exports = router;