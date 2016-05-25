/**
 * Main application routes
 */
'use strict';

var path = require('path');

module.exports = function(app){

  app.use('/api/cluster', require('./api/cluster'));

  app.use('/api/containers', require('./api/containers'));

  app.use('/api/images',require('./api/images'));

  app.use('/api/volumes', require('./api/volumes'));

  var env = app.get('env');
  if ('development' !== env) {
    app.route('/*').get(function(req, res) {
        res.sendFile(path.resolve(__dirname, '../' + app.get('appPath') + '/index.html'));
    });
  }
};
