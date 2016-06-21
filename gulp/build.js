'use strict';

var gulp = require('gulp');
var path = require('path');
var config = require('./config');
var _ = require('lodash');
var wiredep = require('wiredep').stream;

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del','imagemin-pngquant']
});

/*****************angular模板合成JS start*********************************************/
//只有在build的时候才需要
gulp.task('partials', function () {
  return gulp.src([
    path.join(config.paths.src, '/app/**/*.html')
  ])
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe($.angularTemplatecache('templateCacheHtml.js', {
      module: 'dockerApp',
      root: 'app'
    }))
    .pipe(gulp.dest(config.paths.tmp + '/partials/'));
});
/*****************angular模板合成JS end*********************************************/

/*****************html(压缩合并js,css,html) start*********************/
gulp.task('html',['inject','partials'],function () {
	var partialsInjectFile = gulp.src(path.join(config.paths.tmp, '/partials/templateCacheHtml.js'), { read: false });
	var partialsInjectOptions = {
	  starttag: '<!-- inject:partials -->',
	  ignorePath: path.join(config.paths.tmp, '/partials'),
	  addRootSlash: false
	};

	var htmlFilter = $.filter('*.html',{restore: true});
	var jsFilter = $.filter('**/*.js',{restore: true});
	var cssFilter = $.filter('**/*.css',{restore: true});
	var assets = $.useref.assets();

	return gulp.src(path.join(config.paths.tmp, '/serve/*.html'))
		//自动处理全部错误信息防止因为错误而导致 watch 不正常工作
		.pipe($.plumber(config.errorHandler()))
		//注入angular模板文件
		.pipe($.inject(partialsInjectFile, partialsInjectOptions))
		//获取index.html中的文件
		.pipe(assets)
		//js处理
		.pipe(jsFilter)
		.pipe($.ngAnnotate())
		.pipe($.uglify())
		.pipe(jsFilter.restore)
		//css处理
		.pipe(cssFilter)
		.pipe($.replace('../../bower_components/bootstrap-sass/assets/fonts/bootstrap/', '../fonts/'))
		.pipe($.csso())
		.pipe(cssFilter.restore)
		//md5后缀
		.pipe($.rev())
		.pipe(assets.restore())
		.pipe($.useref())
		//替换md5后缀的文件名
		.pipe($.revReplace())
		//html处理
		.pipe(htmlFilter)
		.pipe($.minifyHtml({
		  empty: true,
		  spare: true,
		  quotes: true,
		  conditionals: true
		}))
		.pipe(htmlFilter.restore)
		.pipe(gulp.dest(path.join(config.paths.dist, '/')))
		.pipe($.size({ title: path.join(config.paths.dist, '/'), showFiles: true }));

});
/*****************html end*********************/

/*****************fonts start*********************/
gulp.task('fonts',function () {
	return gulp.src($.mainBowerFiles())
		.pipe($.filter('**/*.{eot,svg,ttf,woff,woff2}'))
		.pipe($.flatten())
		.pipe(gulp.dest(path.join(config.paths.dist,'/fonts/')));
});
/*****************fonts end*********************/

/*****************图片压缩 start*********************/
gulp.task('images',function () {
	return gulp.src([
			path.join(config.paths.src, '/assets/images/**/*'),
			path.join('!' + config.paths.src, '/assets/images/sprite/**/*')
		])
		.pipe($.imagemin({
		    progressive: true,
		    svgoPlugins: [{removeViewBox: false}],
		    use: [$.imageminPngquant()]
		}))
		.pipe(gulp.dest(path.join(config.paths.dist,'/assets/images')));
});
/*****************图片压缩 end*********************/

/*****************复制其它文件 start*********************/
gulp.task('other',function () {
	return gulp.src([
			path.join(config.paths.src, '/**/*'),
			path.join('!' + config.paths.src, '/assets/images/**/*'),
			path.join('!' + config.paths.src, '/**/*.{html,js,css,scss,jade}')
		])
		.pipe($.filter(function (file) {
			return file.stat.isFile();
		}))
		.pipe(gulp.dest(path.join(config.paths.dist,'/')));
});
/*****************复制其它文件 end*********************/

//按顺序执行任务,images需要在html之后执行
gulp.task('build',$.sequence('prod-config',['html'],['fonts','images'],'other'));
