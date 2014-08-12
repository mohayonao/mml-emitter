"use strict";

var fs = require("fs");
var gulp      = require("gulp");
var browerify = require("gulp-browserify");
var istanbul  = require("gulp-istanbul");
var jshint    = require("gulp-jshint");
var mocha     = require("gulp-mocha");
var rename    = require("gulp-rename");
var replace   = require("gulp-replace");
var uglify    = require("gulp-uglify");

var getBrowserTestFiles = function() {
  return fs.readdirSync(__dirname + "/test/wamml")
    .filter(function(filename) {
      return !/^node-/.test(filename);
    })
    .map(function(filename) {
      return "./wamml/" + filename;
    })
    .map(function(filepath) {
      return "    <script src=\"" + filepath + "\"></script>";
    }).join("\n");
};

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
    /* wamml.js */
    .pipe(browerify({
      standalone: "Wamml"
    }))
    .pipe(rename("wamml.js"))
    .pipe(gulp.dest("build"))
    /* wamml.min.js */
    .pipe(uglify())
    .pipe(rename("wamml.min.js"))
    .pipe(gulp.dest("build"));
  /* online test */
  gulp.src("test/index.tmpl")
    .pipe(replace("{{ testfiles }}", getBrowserTestFiles()))
    .pipe(rename("index.html"))
    .pipe(gulp.dest("test"));
});

gulp.task("travis", [ "lint", "cover" ]);
gulp.task("default", [ "lint", "cover", "build" ]);
