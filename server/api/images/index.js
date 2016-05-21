
var express = require('express');
var controller = require('./images.controller');


var router = express.Router();

router.get('/getImagesList', controller.getImagesList);
router.get('/getImagesCount', controller.getImagesCount);
router.get('/:id/getImageDetail', controller.getImageDetail);
router.delete('/:id', controller.deleteImage);


module.exports = router;
