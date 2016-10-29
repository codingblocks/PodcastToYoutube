var gulp = require('gulp');

var sloc = require('gulp-sloc');
gulp.task('loc', function(){
  gulp.src(['*.js'])
    .pipe(sloc({
      reportType: 'json'
    }))
    .pipe(gulp.dest('./reports'));
});

var jshint = require('gulp-jshint');
gulp.task('lint', function() {
  return gulp.src('./upload-to-youtube.js')
    .pipe(jshint({esversion: 6}))
    .pipe(jshint.reporter('gulp-jshint-file-reporter', {
      filename: './reports/jshint-errors.log'
    }));
});

gulp.task('metrics', ['loc', 'lint']);