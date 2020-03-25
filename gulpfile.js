const gulp = require('gulp');
const babelCore = require("@babel/core");
const inlineSource = require('gulp-inline-source');
const minifyHtml = require('gulp-htmlmin');

function inlineSourceBabel(source, context) {
    if (source.filepath.substr(source.filepath.length - 7) === '.jsx.js') {
        source.content = babelCore.transform(source.fileContent, {
            minified: true,
            comments: false,
            plugins: ["@babel/plugin-proposal-class-properties"],
            presets: ["@babel/preset-react", "@babel/preset-env"],
        }).code;
    }
}

gulp.task('default', () => (
    gulp.src('src/index.html')
    .pipe(inlineSource({rootpath: 'src', handlers: [inlineSourceBabel]}))
    .pipe(minifyHtml({collapseWhitespace: true}))
    .pipe(gulp.dest('.'))
));

gulp.task('watch', () => {
    gulp.watch('src/*', gulp.series(['default']));
});
