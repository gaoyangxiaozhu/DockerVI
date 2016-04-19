'use strict';

var gulp = require('gulp');
var path = require('path');
var config = require('./config');
var _ = require('lodash');
var wiredep = require('wiredep').stream;
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'event-stream', 'main-bower-files', 'uglify-save-license', 'del']
});
var browserSync = require('browser-sync');
var gulpNgConfig = require('gulp-ng-config');


/*****************代码检查 start*********************************************/
gulp.task('scripts',function () {
	return gulp.src(path.join(config.paths.src,'app/**/*.js'))
	.pipe($.jshint())
	.pipe($.jshint.reporter('jshint-stylish'))
	//js文件改变时无刷新加载
	.pipe(browserSync.reload({ stream: true }))
	.pipe($.size());
});
/*****************代码检查 end*********************************************/

/*****************clean start*********************************************/
gulp.task('clean', function () {
  $.del([path.join(config.paths.dist, '/'), path.join(config.paths.tmp, '/')]);
});
/*****************clean end*********************************************/
