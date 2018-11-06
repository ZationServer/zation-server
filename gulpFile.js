const gulp              = require('gulp');
const gulpReplace       = require('gulp-replace');
const typescript        = require('gulp-typescript');
const sass              = require('gulp-sass');
const tscConfig         = require('./tsconfig.json');
const OptimizeJs        = require('gulp-optimize-js');
const terser            = require('gulp-terser');
const clean             = require('gulp-clean');
const browserify        = require('browserify');
const source            = require('vinyl-source-stream');
//const tsNameOf          = require('ts-nameof');

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


const nameOf = (match) => {
    return `'${match.substring(match.indexOf('s.')+2,match.indexOf(')')).trim()}'`;
};

gulp.task('ts', function () {
    return gulp
        .src('src/**/*.ts')
        .pipe(gulpReplace(/nameof<[a-zA-Z]*>[(][s =>.a-zA-Z]*[)]/g,nameOf))
        //.pipe(tsNameOf.stream())
        .pipe(typescript(tscConfig.compilerOptions))
        .pipe(gulp.dest('dist'));
});

gulp.task('optimize', function () {
    return gulp
        .src('dist/**/*.js')
        .pipe(OptimizeJs())
        .pipe(terser())
        .pipe(gulp.dest('dist'));
});

gulp.task('cleanDist', function () {
    return gulp.src('dist', {read: false,allowEmpty : true})
        .pipe(clean());
});

gulp.task('cleanPanelBuild', function () {
    return gulp.src('dist/lib/public/panel/ts', {read: false,allowEmpty : true})
        .pipe(clean());
});

gulp.task('bundlePanel', function () {
    // noinspection JSUnresolvedFunction
    return browserify({
        entries: 'dist/lib/public/panel/ts/index.js',
    })
        .bundle()
        .pipe(source('panel.js'))
        .pipe(gulp.dest('dist/lib/public/panel/js'));
});

gulp.task('buildPanel',gulp.series('bundlePanel','cleanPanelBuild'));

gulp.task('compile', gulp.series(gulp.parallel('scss','cof','ts'),'buildPanel','optimize'));

gulp.task('build', gulp.series('cleanDist','compile'));

gulp.task('watch', () => {
    gulp.watch('src/**/*.ts', gulp.parallel('ts'));
    gulp.watch('src/**/*.scss', gulp.parallel('scss'));
    gulp.watch(['src/**/*','!src/**/*.ts','!src/**/*.scss'], gulp.parallel('cof'));
});

gulp.task('default', gulp.series('compile', 'watch'));