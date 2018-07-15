const gulp       = require('gulp');
const typescript = require('gulp-typescript');
const sass       = require('gulp-sass');
const tscConfig  = require('./tsconfig.json');

gulp.task('scss', function() {
    return gulp.src('src/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('dist'));
});

gulp.task('cof', function() {
    return gulp
        .src(['src/**/*','!src/**/*.ts','!src/**/*.scss'])
        .pipe(gulp.dest('dist'));
});

gulp.task('ts', ['mainTs','editToolTs']);

gulp.task('editToolTs', function () {
    return gulp
        .src(['!src/**/*.ts','src/lib/helper/configEditTool/*.ts'])
        .pipe()
        .pipe(typescript(tscConfig.compilerOptions))
        .pipe(gulp.dest('dist'));
});

gulp.task('mainTs', function () {
    return gulp
        .src(['src/**/*.ts','!src/lib/helper/configEditTool/*.ts'])
        .pipe(typescript(tscConfig.compilerOptions))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['compile', 'watch']);

gulp.task('compile', ['scss','cof','ts']);

gulp.task('watch', () => {
    gulp.watch('src/**/*.ts', ['ts']);
    gulp.watch('src/**/*.scss', ['scss']);
    gulp.watch(['src/**/*','!src/**/*.ts','!src/**/*.scss'], ['cof']);
});