var gulp = require('gulp'), 
    gutil = require('gulp-util'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    livereload = require('gulp-livereload');

var jsSources = ['components/scripts/*.js'];

gulp.task('js', function(){
    gulp.src(jsSources)
        /*.pipe(uglify())*/
        .pipe(concat('all-scripts.js'))
        .pipe(gulp.dest('dist/assets/scripts'));
});


gulp.task('watch', function(){
    gulp.watch(jsSources, ['js']);
    

});


gulp.task('default', ['js', 'watch']);

