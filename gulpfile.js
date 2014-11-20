"use strict";

var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var istanbul = require("gulp-istanbul");
var jshint = require("gulp-jshint");
var mocha = require("gulp-mocha");
var rename = require("gulp-rename");
var uglify = require("gulp-uglify");

gulp.task("lint", function() {
  return gulp.src([ "gulpfile.js", "src/**/*.js" ])
    .pipe(jshint(".jshintrc"))
    .pipe(jshint.reporter(require("jshint-stylish")))
    .pipe(jshint.reporter("fail"));
});

gulp.task("test", function() {
  return gulp.src("test/**/*.js")
    .pipe(mocha());
});

gulp.task("cover", function(cb) {
  gulp.src("src/**/*.js")
    .pipe(istanbul())
    .on("finish", function() {
      return gulp.src("test/**/*.js")
        .pipe(mocha())
        .pipe(istanbul.writeReports("coverage"))
        .on("end", cb);
    });
});

gulp.task("build", function() {
  return browserify("./index.js")
    .bundle()
    /* MMLEmitter.js */
    .pipe(source("MMLEmitter.js"))
    .pipe(gulp.dest("build"))
    /* MMLEmitter.min.js */
    .pipe(buffer())
    .pipe(uglify())
    .pipe(rename("MMLEmitter.min.js"))
    .pipe(gulp.dest("build"));
});

gulp.task("travis", [ "lint", "cover" ]);
gulp.task("default", [ "lint", "cover", "build" ]);
