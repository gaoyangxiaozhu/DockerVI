'use strict';

var gulp = require('gulp');
var config = require('./config');
var path = require('path');
var browserSync = require('browser-sync');
var proxyMiddleware = require('http-proxy-middleware');
var browserSyncSpa = require('browser-sync-spa');
var nodemon = require('gulp-nodemon');
	var gulpSequence = require('gulp-sequence');



//开始之前先将必要文件注入
gulp.task('watch', function () {

	gulpSequence('jade', ['inject'], function() {

		//监控jade文件(除index.jade之外)
		gulp.watch([
			path.join(config.paths.src, '/**/*.jade')
		], ['jade']);

		//监控index.jade, 和bower.json文件
		gulp.watch([
			path.join(config.paths.src, '/index.jade'),
			path.join(config.paths.src, '/app/**/*.jade'),
			'bower.json'],['inject']);
		//监控CSS文件
		gulp.watch([
			path.join(config.paths.src, '/app/**/*.scss'),
			path.join(config.paths.src, '/app/*.scss')],
			function (event) {
				gulp.start('inject');
		});
		//监控JS文件
		gulp.watch([path.join(config.paths.src,'/app/**/*.js')],function (event) {
			if(event.type === 'changed'){
				gulp.start('scripts');
			}else{
				gulp.start('inject');
			}
		});
		//监控html文件
		gulp.watch([
				path.join(config.paths.src,'/app/**/*.html')
			],function (event) {
				browserSync.reload(event.path);
			});
	});


});

gulp.task('nodemon',function () {
	nodemon({
	  script: path.join(config.paths.server,'/app.js'),
	  ext: 'js json',
	  watch: [
	    path.join(config.paths.server,'/')
	],
	env: { 'NODE_ENV': 'development' }
  });
});

gulp.task('nodemon:dist',function () {
	nodemon({
	  script: path.join(config.paths.server,'/app.js'),
	  ext: 'js json',
	  watch: [
	    path.join(config.paths.server,'/')
	  ]
  });
});

gulp.task('nodemon:production',function () {
	nodemon({
	  script: path.join(config.paths.server,'/app.js'),
	  ext: 'js json',
	  watch: [
	    path.join(config.paths.server,'/')
	  ],
	  env: { 'NODE_ENV': 'production' }
  });
});

function browserSyncInit (baseDir) {
		// Only needed for angular apps,angular 正确路由需要
		browserSync.use(browserSyncSpa({
		  selector: '[ng-app]'
		}));
		//起动browserSync
	  browserSync.init({
	  	startPath:'/',
	  	server:{
		    baseDir: baseDir,
		    routes: {
		        "/bower_components": "bower_components"
		    },
		    //使用代理
		    middleware:[
			    proxyMiddleware(['/api/**','/auth/**'], {target: 'http://localhost:9000', changeOrigin:true})
			  ]
		},
		socket: {
      			"clients.heartbeatTimeout" : 500000
  			}
		});
}
gulp.task('serve',function () {
	gulpSequence('nodemon',['dev-config','watch'],function () {
		browserSyncInit([path.join(config.paths.tmp, '/serve'), config.paths.src]);
	});
});
gulp.task('serve:dist',function () {
	gulpSequence('nodemon','build',function () {
		browserSyncInit(config.paths.dist);
	});
});
