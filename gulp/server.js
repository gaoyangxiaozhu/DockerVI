'use strict';

var gulp = require('gulp');
var config = require('./config');
var path = require('path');
var browserSync = require('browser-sync');
var proxyMiddleware = require('http-proxy-middleware');
var browserSyncSpa = require('browser-sync-spa');
//var bs = browserSync.create();
var nodemon = require('gulp-nodemon');
var gulpSequence = require('gulp-sequence');

//开始之前先将必要文件注入
gulp.task('watch', function () {
	//监控html文件
	gulp.watch([
			path.join(config.paths.src,'/app/**/*.html')
		],function (event) {
			browserSync.reload(event.path);
		});

});

gulp.task('nodemon',function () {
	nodemon({
	  script: path.join(config.paths.server,'/app.js'),
	  ext: 'js json',
	  watch: [
	    path.join(config.paths.server,'/')
	  ]
	})
});

gulp.task('nodemon:dist',function () {
	nodemon({
	  script: path.join(config.paths.server,'/app.js'),
	  ext: 'js json',
	  watch: [
	    path.join(config.paths.server,'/')
	  ]
	})
});

gulp.task('nodemon:production',function () {
	nodemon({
	  script: path.join(config.paths.server,'/app.js'),
	  ext: 'js json',
	  watch: [
	    path.join(config.paths.server,'/')
	  ],
	  env: { 'NODE_ENV': 'production' }
	})
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
			    proxyMiddleware(['/api/**','/auth/**'], {target: 'http://localhost:9000',changeOrigin:true})
			  ]
			}
		});
}
// gulp.task('serve', ['watch','nodemon'], function () {
// 	browserSyncInit([path.join(config.paths.tmp, '/serve'), config.paths.src]);
// });
gulp.task('serve',function () {
	gulpSequence('nodemon',['watch'],function () {
		browserSyncInit([path.join(config.paths.tmp, '/serve'), config.paths.src]);
	});
});
gulp.task('serve:dist',function () {
	gulpSequence('nodemon','build',function () {
		browserSyncInit(config.paths.dist);
	});
});
