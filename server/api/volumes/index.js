
var express = require('express');
var controller = require('./volumes.controller');


var router = express.Router();

router.get('/getVolumesList', controller.getVolumesList);
router.get('/searchVolume', controller.getVolumesList);
router.get('/getVolumesCount', controller.getVolumesCount);
router.get('/:id/getVolumesDetail', controller.getVolumesDetail);
router.post('/:id', controller.createNewVolume);
router.delete('/:id', controller.deleteVolume);


module.exports = router;
