var gulp = require('gulp');
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var watch = require('gulp-watch');

// jade to html

gulp.task('jade', function(){
  gulp.src('*.jade')
  .pipe(jade({
    pretty: true
  }))
  .pipe(gulp.dest('./build/'))
})

//stylus to css
gulp.task('stylus', function(){
  gulp.src('*.styl')
  .pipe(stylus())
  .pipe(gulp.dest('./build/css/'))

})
//watcher

gulp.task('watch', function(){
  gulp.watch('*.styl', ['stylus'])
  gulp.watch('*.jade', ['jade'])
})

// default

gulp.task('default', ['watch', 'jade', 'stylus'])
