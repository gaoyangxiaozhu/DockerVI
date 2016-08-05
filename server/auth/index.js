'use strict';

var express = require('express');
var passport = require('passport');
var config = require('../config/env');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var auth = require('./auth.service');

// Passport Configuration
require('./local/passport').setup(User, config);

var router = express.Router();

router.use('/local', require('./local'));
module.exports = router;
