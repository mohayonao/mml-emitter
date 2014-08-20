"use strict";

var gulp      = require("gulp");
var browerify = require("gulp-browserify");
var istanbul  = require("gulp-istanbul");
var jshint    = require("gulp-jshint");
var mocha     = require("gulp-mocha");
var rename    = require("gulp-rename");
var uglify    = require("gulp-uglify");

gulp.task("lint", function() {
  gulp.src([ "gulpfile.js", "src/**/*.js" ])
    .pipe(jshint(".jshintrc"))
    .pipe(jshint.reporter(require("jshint-stylish")))
    .pipe(jshint.reporter("fail"));
});

gulp.task("test", function() {
  gulp.src("test/**/*.js")
    .pipe(mocha());
});

gulp.task("cover", function() {
  gulp.src("src/**/*.js")
    .pipe(istanbul())
    .on("finish", function() {
      return gulp.src("test/**/*.js")
        .pipe(mocha())
        .pipe(istanbul.writeReports("coverage"));
    });
});

gulp.task("build", function() {
  gulp.src("index.js")
    /* MMLEmitter.js */
    .pipe(browerify({
      standalone: "MMLEmitter"
    }))
    .pipe(rename("MMLEmitter.js"))
    .pipe(gulp.dest("build"))
    /* MMLEmitter.min.js */
    .pipe(uglify())
    .pipe(rename("MMLEmitter.min.js"))
    .pipe(gulp.dest("build"));
});

gulp.task("travis", [ "lint", "cover" ]);
gulp.task("default", [ "lint", "cover", "build" ]);
