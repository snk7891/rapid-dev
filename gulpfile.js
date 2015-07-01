var $TARGET_DIR = "./dist";

var gulp = require('gulp')
, less = require('gulp-less')
, minifyCSS = require('gulp-minify-css')
, vendor = require('gulp-concat-vendor')
, jshint = require('gulp-jshint')
, uglify = require('gulp-uglify')
, rename = require('gulp-rename')
, concat = require('gulp-concat')
, jade = require('gulp-jade')
, minimist = require('minimist')
, browserSync = require('browser-sync').create()
, fs = require('fs')
;

var argv = minimist(process.argv.slice(2));
$MINIFY = argv.m || argv.minify;

gulp.task('static', function() {
    gulp.src('static/**')
      .pipe(gulp.dest($TARGET_DIR));
});

gulp.task('libs', function() {
  gulp.src([
      'bower_components/bootstrap/dist/fonts/**'
     ])
      .pipe(gulp.dest($TARGET_DIR + '/fonts/')); 
  
    gulp.src([
      'bower_components/bootstrap/dist/css/bootstrap.min.css'
     ])
      .pipe(vendor('ext.min.css'))
      .pipe(gulp.dest($TARGET_DIR + '/css/')); 
      
    return gulp.src([
      'bower_components/jquery/dist/jquery.min.js',
      'bower_components/bootstrap/dist/js/bootstrap.min.js'
    ])
    .pipe(uglify())
    .pipe(vendor('ext.min.js'))
    .pipe(gulp.dest($TARGET_DIR + '/js/'));
});
gulp.task('deps', ['libs']);

gulp.task('lint', function () {
  return gulp.src('js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('scripts', function() {
  
  var stream = gulp.src('js/**/*.js')
  .pipe(concat('app.js'))
  .pipe(gulp.dest('tmp'))
  .pipe(rename({ suffix: '.min' }));
  
  if($MINIFY)
    stream = stream.pipe(uglify());
    
  return stream.pipe(gulp.dest($TARGET_DIR + '/js/'));
});

gulp.task('styles', function() {
  var stream = gulp.src('less/**/*.less')
    .pipe(concat('app.css'))
    .pipe(gulp.dest('tmp'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(less());
    
  if($MINIFY)
    stream = stream.pipe(minifyCSS());

  return stream.pipe(gulp.dest($TARGET_DIR + '/css/'));
});

gulp.task('jade', function() {
  gulp.src('jade/index.jade')
    .pipe(jade({
      pretty: !$MINIFY
    }))
    .pipe(gulp.dest($TARGET_DIR));
});

function delayedReload() {
  setTimeout(function() {
    browserSync.reload();
  }, 250);
} // delayedReload

gulp.task('scripts-watch', ['lint', 'scripts'], delayedReload);
gulp.task('styles-watch', ['styles'], delayedReload);
gulp.task('views-watch', ['jade'], delayedReload);
gulp.task('static-watch', ['static'], delayedReload);

gulp.task('serve', ['libs', 'static', 'scripts', 'styles', 'jade'], function () {
    browserSync.init({
        server: {
            baseDir: $TARGET_DIR
        }
    });
    
    gulp.watch("js/**/*.js", ['scripts-watch']);
    gulp.watch("less/**/*.less", ['styles-watch']);
    gulp.watch("jade/**/*.jade", ['views-watch']);
    gulp.watch("static/**", ['static-watch']);
});

gulp.task('package', ['static', 'libs', 'scripts', 'styles', 'jade'], function() {
  console.log("Warning: bower update may be needed if this is afresh install");
});
