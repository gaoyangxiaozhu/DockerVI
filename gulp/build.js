'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var watch = require('gulp-watch');

// jade to html

gulp.task('jade', function(){
    gulp.src('./angular/*.jade')
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('../docker_visual/static/angular/'))
    gulp.src('*.jade')
    .pipe(jade({
    pretty: true
    }))
    .pipe(gulp.dest('../docker_visual/templates/'))
})

//stylus to css
gulp.task('stylus', function(){
  gulp.src('*.styl')
  .pipe(stylus())
  .pipe(gulp.dest('../docker_visual/static/css/'))

})
//watcher

gulp.task('watch', function(){
  gulp.watch('*.styl', ['stylus'])
  gulp.watch(['*.jade', './angular/*.jade'], ['jade'])
})

// default

gulp.task('build', ['watch', 'jade', 'stylus'])
