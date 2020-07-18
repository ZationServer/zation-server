const {src,dest,series,parallel} = require('gulp');
const del               = require('del');
const typescript        = require('gulp-typescript');
const terser            = require('gulp-terser');

const tsNameof          = require('ts-nameof');
const keysTransformer   = require('ts-transformer-keys/transformer').default;

const outputFolder = 'dist';

const tscConfig = require('./tsconfig.json');
tscConfig.compilerOptions.getCustomTransformers = (program) => ({
    before: [
        tsNameof,
        keysTransformer(program)
    ]
});

function clean() {
    return del(outputFolder);
}

function compile() {
    return src('src/**/*.ts')
        .pipe(typescript(tscConfig.compilerOptions))
        .pipe(dest(outputFolder));
}

function copyAssets() {
    return src(['src/**/*','!src/**/*.ts','!src/**/*.scss'])
        .pipe(dest(outputFolder));
}

function optimize() {
    return src(`${outputFolder}/**/*.js`)
        .pipe(terser())
        .pipe(dest(outputFolder));
}

const build = series(clean,parallel(compile,copyAssets),optimize);

module.exports = {
    clean,
    compile,
    copyAssets,
    build,
    default: build
};