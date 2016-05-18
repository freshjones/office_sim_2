var gulp              = require('gulp');
var concat            = require("gulp-concat");
var sass              = require('gulp-sass');
var ngHtml2Js         = require("gulp-ng-html2js");

var browserSync   = require('browser-sync').create();
var reload        = browserSync.reload;


var EXPRESS_PORT      = 4000;
var EXPRESS_ROOT      = __dirname;

// Let's make things more readable by
// encapsulating each part's setup
// in its own method
function startExpress() 
{
  var express = require('express');
  var app = express();
  app.use(express.static(EXPRESS_ROOT));
  app.listen(EXPRESS_PORT);
}

gulp.task('js', function () 
{
  gulp.src('./src/**/*.js')
    .pipe(concat('app.js'))
    .pipe(gulp.dest('js'));
});

gulp.task('templates', function () 
{
    gulp.src("./src/**/*.html")
      .pipe(ngHtml2Js({
          moduleName: "templates",
          prefix:'/src/'
      }))
      .pipe(concat("templates.js"))
      .pipe(gulp.dest('js'));
});

gulp.task('browsersync', function() {
  browserSync.init(null, {
    proxy: "http://localhost:4000"
  });
});



// Default task that will be run
// when no parameter is provided
// to gulp
gulp.task('default', ['browsersync'], function () {

  startExpress();
  gulp.watch('index.html').on('change', reload);
  gulp.watch(['./src/**/*.html'], ['templates']).on('change', reload);
  gulp.watch(['./src/**/*.js'], ['js']).on('change', reload);

});