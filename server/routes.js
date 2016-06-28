/**
 * Main application routes
 */
'use strict';

var path = require('path');

module.exports = function(app){

    //重定向 /xxx/ to /xxx
    app.use(function (req, res, next) {
      if(req.originalUrl && req.originalUrl.lastIndexOf('/') == req.originalUrl.length - 1){
          res.redirect(req.originalUrl.slice(0, -1));
      }else{
          next();
      }
    });
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
