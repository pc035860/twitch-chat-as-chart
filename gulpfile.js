var extend = require('extend');
var path = require('path');

var gulp = require('gulp');
var env = require('gulp-env');
var webpack = require('webpack-stream');
var clean = require('gulp-clean');

var paths = {
  public: path.resolve(__dirname, '..', '..', 'public'),
  clean: ['build/*']
};

gulp.task('clean', function () {
  return gulp.src(paths.clean).pipe(clean());
});

gulp.task('build', ['clean'], function () {
  env({
    vars: {
      NODE_ENV: 'production'
    }
  });

  return gulp.src('./app/index.js')
  .pipe(webpack( require('./webpack.config.js') ))
  .pipe(gulp.dest('build/'));
});

gulp.task('dev', ['clean'], function () {
  var webpackConfig = {
    watch: true,
    cache: true
  };

  env({
    vars: {
      NODE_ENV: 'production',
      WEBPACK_NO_COMPRESS: 1
    }
  });

  return gulp.src('./app/index.js')
  .pipe(webpack( extend(require('./webpack.config.js'), webpackConfig) ))
  .pipe(gulp.dest('build/'));
});

gulp.task('watch', ['clean', 'dev']);
gulp.task('default', ['clean', 'build']);
