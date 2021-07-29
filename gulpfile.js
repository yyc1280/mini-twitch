const gulp = require("gulp")
const cleanCSS = require("gulp-clean-css")
const uglify = require("gulp-uglify")
const webpack = require("webpack-stream")
const inline = require("gulp-inline")
const rename = require("gulp-rename")

gulp.task("minify-css", () => gulp
  .src("styles/*.css")
  .pipe(rename("style.min.css"))
  .pipe(cleanCSS({ compatibility: "ie8" }))
  .pipe(gulp.dest("dist")))

gulp.task("webpack", () => gulp
  .src("src/index.js")
  // eslint-disable-next-line global-require
  .pipe(webpack(require("./webpack.config")))
  .pipe(gulp.dest("dist")))

gulp.task("minify-js", () => gulp.src("dist/*.js").pipe(uglify()).pipe(gulp.dest("dist")))

gulp.task("inline", () => gulp
  .src("index.html")
  .pipe(
    inline({
      base: "./",
    }),
  ).pipe(gulp.dest("dist/")))

gulp.task(
  "default",
  gulp.series("minify-css", "webpack", "minify-js", "inline"),
)
