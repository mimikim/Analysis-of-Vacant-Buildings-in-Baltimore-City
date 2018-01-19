// include plugins
var gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    jshint       = require('gulp-jshint'),
    concat       = require('gulp-concat'),
    uglify       = require('gulp-uglify'),
    rename       = require('gulp-rename'),
    babel        = require('gulp-babel');

var path = {
    scss: {
        src: 'assets/scss/*.scss',
        dest: 'assets/css'
    },
    js: {
        vendor: 'assets/js/vendor/*',
        src: 'assets/js/script.js',
        dest: 'assets/js'
    }
};

// sassy sass sass
gulp.task('sass', function() {
    return gulp.src(path.scss.src)
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'ie >= 9', 'and_chr >= 2.3'],
            cascade: false
        }))
        .pipe(rename('style.min.css'))
        .pipe(gulp.dest(path.scss.dest));
});

// linter
gulp.task('lint', function() {
    return gulp.src(path.js.src)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// concat vendor & script files, then minify
gulp.task('scripts', function() {
    return gulp.src([path.js.src, path.js.vendor])
        .pipe(concat('all.js'))
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(path.js.dest));
});

// watcher
gulp.task('watch', function() {
    gulp.watch(path.js.src, ['lint', 'scripts']);
    gulp.watch(path.scss.src, ['sass']);
});

// start!
gulp.task('default', ['lint', 'sass', 'scripts', 'watch']);