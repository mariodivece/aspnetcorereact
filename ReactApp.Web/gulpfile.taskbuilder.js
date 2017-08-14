
var gulp = require("gulp"),
    clean = require('gulp-clean'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    gutil = require('gulp-util');;

/**
 * Represents an automatic Gulp task builder.
 * Helps the creation of chained tasks to transpile, minify and bundle
 * stuff like js, jsx, and sass
 * @param string taskName
 * @param {any} options
 */
var GulpTaskBuilder = function (taskName, options) {

    /**
     * Holds the name of the task. Must be a string
     * Good examples are lib, js, app, jsx, components, css, styles
     * This name is typically the same name as your folder.
     */
    this.taskName = taskName; //"jsx";

    /**
     * Holds the base direactory from which the files will be read.
     * All paths are prepended with this string. Do not add a trailing
     * forward slash to this property.
     * Example: "./wwwroot/jsx"
     */
    this.rootDir = "";

    /**
     * Holds a reference to the transpiler function to use. Set to null
     * if no transpiling is necessary. The datatype is an imported gulp
     * module. Examples: babel, sass,
     */
    this.transpiler = null;

    /**
     * Holds an object that will be passed as the argument to the transpiler.
     * Set to null to avoid passing any extra argument. For example, when using babel,
     * you can pass something like: { presets: ['es2015', 'react'] }
     * Make sure you import those modules.
     */
    this.transpilerArgs = null;

    /**
     * Holds a string or an array of strings representing gulp sources with
     * or without globbing patterns. Always start with forward slash.
     * Examples: "/*.jsx", ['/component1.jsx', '/component2.jsx']
     */
    this.transpilerInput = "/**/*.jsx";

    /**
     * Holds a string with the file extension for the individual transpiled
     * files. Always start with a dot (.)
     * Examples: ".jsx.js", ".scss.css"
     */
    this.transpilerOutput = ".jsx.js";

    /**
     * Holds a reference to the minifier function to use. Set to null
     * if no minification is necessary. The datatype is an imported gulp
     * module. Examples: uglify, minifycss,
     */
    this.minifier = null; // uglify;

    /**
     * Holds a string or an array of strings representing gulp sources with
     * or without globbing patterns. Always start with forward slash.
     * Examples: "/*.jsx.js", ['/component1.jsx.js', '/component2.jsx.js']
     */
    this.minifierInput = "/**/*.jsx.js";

    /**
     * Holds a string with the file extension for the individual minified
     * files. Always start with a dot (.)
     * Examples: ".jsx.min.js", ".scss.min.css"
     */
    this.minifierOutput = ".min.js";

    /**
     * Holds a reference to the bundler function to use (concatenation). Set to null
     * if no bundling is necessary. The datatype is an imported gulp
     * module. Examples: concat
     */
    this.bundler = null; // concat;

    /**
     * Holds a string or an array of strings representing gulp sources with
     * or without globbing patterns. Always start with forward slash.
     * Examples: "/*.jsx.min.js", ['/component1.jsx.min.js', '/component2.jsx.min.js']
     * Note files are concatenated in the order they are provided.
     */
    this.bundlerInput = "/**/*.jsx.min.js";

    /**
     * Holds a string with the file name (not full path) that contains the 
     * bundled files. Always provide just a filename (no path)
     * Examples: jsx.bundle.js
     */
    this.bundlerOutput = "jsx.bundle.js";

    Object.assign(this, options);

    this.handlePlumberError = function (err) {
        gutil.beep();
        gutil.log(err);
    };
};

GulpTaskBuilder.prototype.updateWatchPaths = function (sourcePath) {
    var builder = this;
    if (builder.watchPaths != null) return;
    if (sourcePath == null) return;
    var result = new Array();
    if (Array.isArray(sourcePath) && sourcePath.length > 0) {
        for (var i = 0; i < sourcePath.length; i++) {
            result.push(builder.rootDir + "/" + sourcePath[i]);
        }

        builder.watchPaths = result;
    }

    if (typeof sourcePath == "string") {
        result.push(builder.rootDir + "/" + sourcePath);
        builder.watchPaths = result;
    }
};

GulpTaskBuilder.prototype.gulpSrc = function (sourcePath) {
    var builder = this;
    if (sourcePath == null) return null;
    var result = new Array();
    if (Array.isArray(sourcePath) && sourcePath.length > 0) {
        for (var i = 0; i < sourcePath.length; i++) {
            result.push(builder.rootDir + "/" + sourcePath[i]);
        }

        return result;
    }

    if (typeof sourcePath == "string") {
        result.push(builder.rootDir + "/" + sourcePath);
        builder.watchPaths = result;
        return result;
    }
};

GulpTaskBuilder.prototype.logTask = function (taskName, taskInputs, taskOutput) {
    gutil.log("Task: " + gutil.colors.yellow(taskName));
    gutil.log("    Inputs:");
    for (var i = 0; i < taskInputs.length; i++)
        gutil.log("      " + gutil.colors.magenta(taskInputs[i]));

    gutil.log("    Outputs:");
    gutil.log("      " + gutil.colors.magenta(taskOutput));
};

GulpTaskBuilder.prototype.buildTasks = function () {

    var builder = this;
    builder.cleanTaskName = builder.taskName + ":sub:00:clean";
    builder.transpileTaskName = builder.taskName + ":sub:01:transpile";
    builder.minifyTaskName = builder.taskName + ":sub:02:minify";
    builder.bundleTaskName = builder.taskName + ":sub:03:bundle";

    builder.chainTaskName = builder.taskName + ":all";
    builder.watchPaths = null;

    var cleanTargets = new Array();

    if (builder.transpiler != null) {
        cleanTargets.push(builder.rootDir + '/**/*' + builder.transpilerOutput);
        builder.updateWatchPaths(builder.transpilerInput);
    } else {
        builder.transpileTaskName = null;
    }

    if (builder.minifier != null) {
        cleanTargets.push(builder.rootDir + '/**/*' + builder.minifierOutput);
        builder.updateWatchPaths(builder.minifierInput);
    } else {
        builder.minifyTaskName = null;
    }

    if (builder.bundler != null) {
        cleanTargets.push(builder.rootDir + '/' + builder.bundlerOutput);
        builder.updateWatchPaths(builder.bundlerInput);
    } else {
        builder.bundleTaskName = null;
    }

    if (cleanTargets.length <= 0) { builder.cleanTaskName = null; }

    var previousTaskName = null;

    if (builder.cleanTaskName != null) {
        gulp.task(builder.cleanTaskName, function (cb) {
            builder.logTask(builder.cleanTaskName, cleanTargets, "(Delete Files)");
            var t = gulp.src(cleanTargets, { read: false })
                .pipe(plumber({ errorHandler: builder.handlePlumberError }))
                .pipe(clean({ force: true }));
            return t;
        });

        previousTaskName = builder.cleanTaskName;
    }

    if (builder.transpileTaskName != null) {
        gulp.task(builder.transpileTaskName,
            previousTaskName != null ? [previousTaskName] : null, function (cb) {
                var taskName = builder.transpileTaskName;
                var taskInputs = builder.gulpSrc(builder.transpilerInput);
                var taskOutput = builder.transpilerOutput;
                builder.logTask(taskName, taskInputs, builder.rootDir + "/(**/*" + taskOutput + ")");

                var t = gulp.src(taskInputs)
                    .pipe(plumber({ errorHandler: builder.handlePlumberError }))
                    .pipe(builder.transpiler(builder.transpilerArgs))
                    .pipe(rename(function (path) { path.extname = taskOutput; }))
                    .pipe(gulp.dest(builder.rootDir));

                return t;
            });

        previousTaskName = builder.transpileTaskName;
    }

    if (builder.minifyTaskName != null) {
        gulp.task(builder.minifyTaskName, previousTaskName != null ? [previousTaskName] : null, function (cb) {
            var taskName = builder.minifyTaskName;
            var taskInputs = builder.gulpSrc(builder.minifierInput);
            var taskOutput = builder.minifierOutput;
            builder.logTask(taskName, taskInputs, builder.rootDir + "/(**/*" + taskOutput + ")");

            var t = gulp.src(taskInputs)
                .pipe(plumber({ errorHandler: builder.handlePlumberError }))
                .pipe(builder.minifier())
                .pipe(rename(function (path) { path.extname = taskOutput; }))
                .pipe(gulp.dest(builder.rootDir));

            return t;
        });

        previousTaskName = builder.minifyTaskName;
    }

    if (builder.bundleTaskName != null) {
        gulp.task(builder.bundleTaskName, previousTaskName != null ? [previousTaskName] : null, function (cb) {
            var taskName = builder.minifyTaskName;
            var taskInputs = builder.gulpSrc(builder.bundlerInput);
            var taskOutput = builder.bundlerOutput;
            builder.logTask(taskName, taskInputs, builder.rootDir + "/" + taskOutput);

            var t = gulp.src(taskInputs)
                .pipe(plumber({ errorHandler: builder.handlePlumberError }))
                .pipe(builder.bundler(taskOutput))
                .pipe(gulp.dest(builder.rootDir));

            return t;
        });

        previousTaskName = builder.bundleTaskName;
    }

    if (previousTaskName != null) {
        gulp.task(builder.chainTaskName, [previousTaskName]);

        gulp.task('_auto:watch:' + builder.taskName, function () {
            gutil.log("Watch task for " + gutil.colors.yellow(builder.chainTaskName));
            gutil.log(gutil.colors.magenta(builder.watchPaths));
            return gulp.watch(builder.watchPaths, [builder.chainTaskName]);
        });

    } else {
        builder.chainTaskName = null;
    }

};

module.exports = GulpTaskBuilder;
