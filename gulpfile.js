/*
* Gulp Tasks.
*/
var gulp = require("gulp");
var babel = require("gulp-babel");

gulp.task("babel", function () {
	return gulp.src("src/**/*.js")
		.pipe(babel({
			presets: ["babel-preset-es2015"]
		}))
		.pipe(gulp.dest("lib"));
});

gulp.task("copy-img", function () {
	return gulp.src("assets")
})

gulp.task("watch", ["babel"], function () {
	gulp.watch("src/**/*.js",["babel"])
})


gulp.task("default", ["watch"]);