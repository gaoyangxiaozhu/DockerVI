'use strict';

var express = require('express');
var controller = require('./images.controller');


var router = express.Router();

router.get('/getImagesList', controller.list);

module.exports = router;
