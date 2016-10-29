const gulp = require('gulp');

const clean = require('gulp-clean');
gulp.task('clean', function () {
    return gulp.src('./reports/*', {read: false})
        .pipe(clean());
});

const sloc = require('gulp-sloc');
gulp.task('loc', ['clean'], function(){
  gulp.src(['*.js'])
    .pipe(sloc({
      reportType: 'json'
    }))
    .pipe(gulp.dest('./reports/loc'));
});

const jshint = require('gulp-jshint');
gulp.task('lint', ['clean'], function() {
  const fs = require('fs');
  var dir = './reports/lint/';

  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
  return gulp.src('./upload-to-youtube.js')
    .pipe(jshint({esversion: 6}))
    .pipe(jshint.reporter('gulp-jshint-file-reporter', {
      filename: './reports/lint/jshint-errors.log'
    }));
});

const istanbul = require('gulp-istanbul');
gulp.task('setup-coverage', ['clean'], function () {
  return gulp.src(['./upload-to-youtube.js'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

const mocha = require('gulp-mocha'); 
gulp.task('test', ['clean', 'setup-coverage'], () => 
    gulp.src('./tests/tests.js', {read: false})
        .pipe(mocha())
        .pipe(istanbul.writeReports('./reports/coverage'))
);

gulp.task('metrics', ['clean', 'loc', 'lint', 'test']);