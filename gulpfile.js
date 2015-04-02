var gulp = require('gulp');
var del = require('del');
var karma = require('karma').server;
var reporters = require('jasmine-reporters');
var plug = require('gulp-load-plugins')();


gulp.task('lib-clean', function (done) {
  del('./lib', done);
});

gulp.task('lib-compile', ['lib-clean'], function () {
  return gulp.src([
    './src/**/*.js',
    './src/**/*.jsx',
    '!./src/preprocessor.js',
    '!./src/__tests__/**'
  ])
  .pipe(plug.plumber())
  .pipe(plug.babel({}))
  .pipe(plug.regexReplace({regex: "\\.jsx", replace: ''}))
  .pipe(plug.rename({ extname: '.js' }))
  .pipe(gulp.dest('./lib'));
});

gulp.task('watch', ['lib'], function() {
  return gulp.watch(['src/**/*'], ['lib']);
});

gulp.task('test:service', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

gulp.task('test:unit', ['lib'], function () {
  return gulp.src('tests/*.js')
    .pipe(plug.jasmine({
      reporter: new reporters.TerminalReporter({
        showStack: true
      })
    }));
});

gulp.task('test', ['lib', 'test:unit', 'test:service']);
gulp.task('lib', ['lib-clean', 'lib-compile']);
gulp.task('default', ['lib']);