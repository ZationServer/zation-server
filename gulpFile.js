const gulp              = require('gulp');
const gulpReplace       = require('gulp-replace');
const typescript        = require('gulp-typescript');
const tscConfig         = require('./tsconfig.json');
const OptimizeJs        = require('gulp-optimize-js');
const terser            = require('gulp-terser');
const clean             = require('gulp-clean');
//const tsNameOf          = require('ts-nameof');

gulp.task('cof', function() {
    return gulp
        .src(['src/**/*','!src/**/*.ts','!src/**/*.scss'])
        .pipe(gulp.dest('dist'));
});


const nameOf = (match) => {
    return `'${match.substring(match.indexOf('.')+1,match.indexOf(')')).trim()}'`;
};

gulp.task('ts', function () {
    return gulp
        .src('src/**/*.ts')
        .pipe(gulpReplace(/nameof<[a-zA-Z<>{}]*>[(][ =>.a-zA-Z_]*[)]/g,nameOf))
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

gulp.task('compile', gulp.series(gulp.parallel('cof','ts'),'optimize'));

gulp.task('build', gulp.series('cleanDist','compile'));

gulp.task('watch', () => {
    gulp.watch('src/**/*.ts', gulp.parallel('ts'));
    gulp.watch(['src/**/*','!src/**/*.ts'], gulp.parallel('cof'));
});

gulp.task('default', gulp.series('compile', 'watch'));