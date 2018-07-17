const gulp         = require('gulp');
const gulpIgnore   = require('gulp-ignore');
const gulpReplace  = require('gulp-replace');
const typescript   = require('gulp-typescript');
const sass         = require('gulp-sass');
const tscConfig    = require('./tsconfig.json');

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
    return tempRes;
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

gulp.task('ts', ['mainTs'], () =>
{
    // noinspection JSUnresolvedFunction
    gulp.start('cetTs');
});

gulp.task('default', ['compile', 'watch']);

gulp.task('compile', ['scss','cof','ts']);

gulp.task('watch', () => {
    gulp.watch('src/**/*.ts', ['ts']);
    gulp.watch('src/**/*.scss', ['scss']);
    gulp.watch(['src/**/*','!src/**/*.ts','!src/**/*.scss'], ['cof']);
});