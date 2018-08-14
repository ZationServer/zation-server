const gulp              = require('gulp');
const gulpIgnore        = require('gulp-ignore');
const gulpReplace       = require('gulp-replace');
const typescript        = require('gulp-typescript');
const sass              = require('gulp-sass');
const tscConfig         = require('./tsconfig.json');
const OptimizeJs        = require('gulp-optimize-js');
const terser            = require('gulp-terser');
const clean             = require('gulp-clean');

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

const isConfigEditorFile = (file) =>
{
    return file.path.match(`^.*src\\\\lib\\\\helper\\\\configEditTool\\\\.*[.ts]$`);
};

const replaceConst = (match) =>
{
    const Const          = require('./dist/lib/helper/constants/constWrapper');
    const pathToConstant =  match.replace(new RegExp(/[\[\]]*/, 'g'),'').split('.');
    let tempRes = Const;
    for(let i= 1; i < pathToConstant.length; i++) {
        if(tempRes.hasOwnProperty(pathToConstant[i])) {
            tempRes = tempRes[pathToConstant[i]];
        }
        else {
            return undefined;
        }
    }
    return `'${tempRes}' `;
};

gulp.task('cetTs', function () {
    return gulp
        .src('src/**/*.ts')
        .pipe(gulpIgnore.include(isConfigEditorFile))
        .pipe(gulpReplace(/\[Const[a-zA-Z_.]*]/g,replaceConst))
        .pipe(typescript(tscConfig.compilerOptions))
        .pipe(gulp.dest('dist'));
});

gulp.task('mainTs', function () {
    return gulp
        .src('src/**/*.ts')
        .pipe(gulpIgnore.exclude(isConfigEditorFile))
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

gulp.task('ts', gulp.series('mainTs','cetTs'));

gulp.task('compile', gulp.series(gulp.parallel('scss','cof','ts'),'optimize'));

gulp.task('build', gulp.series('cleanDist','compile'));

gulp.task('watch', () => {
    gulp.watch('src/**/*.ts', gulp.parallel('ts'));
    gulp.watch('src/**/*.scss', gulp.parallel('scss'));
    gulp.watch(['src/**/*','!src/**/*.ts','!src/**/*.scss'], gulp.parallel('cof'));
});

gulp.task('default', gulp.series('compile', 'watch'));