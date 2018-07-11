const gulp       = require('gulp');
const typescript = require('gulp-typescript');
const sass       = require('gulp-sass');
const tscConfig  = require('./tsconfig.json');

gulp.task('ts', function () {
    return gulp
        .src('src/**/*.ts')
        .pipe(typescript(tscConfig.compilerOptions))
        .pipe(gulp.dest('compiled'));
});

gulp.task('scss', function() {
    return gulp.src('src/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('compiled'));
});

gulp.task('cof', function() {
    return gulp
        .src([
            'src/**/*.png',
            'src/**/*.xml',
            'src/**/*.webmanifest',
            'src/**/*.svg',
            'src/**/*.jpeg',
            'src/**/*.js',
            'src/**/*.ico',
            'src/**/*.html'
        ])
        .pipe(gulp.dest('compiled'));
});

gulp.task('default', ['compile', 'watch']);

gulp.task('compile', ['scss','cof','ts']);

gulp.task('watch', function(cb) {

    gulp.watch('src/**/*.ts', ['ts']);
    gulp.watch('src/**/*.scss', ['scss']);

    gulp.watch(
        [
            'src/**/*.png',
            'src/**/*.xml',
            'src/**/*.webmanifest',
            'src/**/*.svg',
            'src/**/*.jpeg',
            'src/**/*.js',
            'src/**/*.ico',
            'src/**/*.html'
        ],
        ['cof']);
});