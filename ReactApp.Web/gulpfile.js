/// <binding BeforeBuild='_auto:build' ProjectOpened='_auto:watch:css, _auto:watch:jsx, _auto:watch:lib' />
/*
This file is the main entry point for defining Gulp tasks and using Gulp plugins.
It implements a simple, per-directory build system that can handle ES2015, saas, jsx, etc.
It also creates _auto tasks for automatically rebuilding bundles, cleaning files and watching for changes 
*/

var wwwwRoot = "./wwwroot";
var gulp = require("gulp"),
    taskbuilder = require('./gulpfile.taskbuilder'),
    sass = require("gulp-sass"),
    minifycss = require("gulp-minify-css"),
    concat = require("gulp-concat"),
    uglify = require("gulp-uglify"),
    babel = require('gulp-babel');

var taskBuilders = new Array();

taskBuilders.push(new taskbuilder("css", {
    rootDir: wwwwRoot + "/css",
    transpiler: sass,
    transpilerInput: "**/*.scss",
    transpilerOutput: ".scss.css",
    minifier: minifycss,
    minifierInput: "**/*.scss.css",
    minifierOutput: ".min.css",
    bundler: concat,
    bundlerInput: "**/*.min.css",
    bundlerOutput: "css.bundle.css"
}));

taskBuilders.push(new taskbuilder("lib", {
    rootDir: wwwwRoot + "/lib",
    minifier: uglify,
    minifierInput: ["react-15.6.1.js", "react-dom-15.6.1.js", "remarkable-1.6.0.js"],
    minifierOutput: ".min.js",
    bundler: concat,
    bundlerInput: "**/*.min.js",
    bundlerOutput: "lib.bundle.js"
}));

taskBuilders.push(new taskbuilder("jsx", {
    rootDir: wwwwRoot + "/jsx",
    transpiler: babel,
    transpilerArgs: { presets: ['es2015', 'react', 'stage-0'] },
    transpilerInput: "**/*.jsx",
    transpilerOutput: ".jsx.js",
    minifier: uglify,
    minifierInput: "**/*.jsx.js",
    minifierOutput: ".min.js",
    bundler: concat,
    bundlerInput: "**/*.jsx.min.js",
    bundlerOutput: "jsx.bundle.js"
}));

var taskChains = new Array();
var cleanTasks = new Array();
for (var i = 0; i < taskBuilders.length; i++) {
    taskBuilders[i].buildTasks();
    taskChains.push(taskBuilders[i].chainTaskName);
    if (taskBuilders[i].cleanTaskName != null)
        cleanTasks.push(taskBuilders[i].cleanTaskName);
}

gulp.task('_auto:build', taskChains);

gulp.task('_auto:clean', cleanTasks);
