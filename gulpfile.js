const gulp = require('gulp');
const server = require('gulp-server-livereload');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const gcmq = require('gulp-group-css-media-queries');
const less = require('gulp-less');
const useref = require('gulp-useref');
const gulpif = require('gulp-if');
const uglify = require('gulp-uglify');
const minifyCss = require('gulp-csso');
const imagemin = require('gulp-imagemin');
const gutil = require('gulp-util');
const ftp = require('gulp-ftp');
const babel = require('gulp-babel');
 
gulp.task('babel', () =>
    gulp.src('dev/js/main.js')
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(gulp.dest('dev/js/bundle'))
);

gulp.task('ftp', function () {
    return gulp.src('public/**/*')
        .pipe(ftp({
            host: 'wwweblab.ftp.ukraine.com.ua',
            user: 'wwweblab_js',
            pass: 'ftpjs',
			remotePath: '/WeatherUA'
        }))
        // you need to have some kind of stream after gulp-ftp to make sure it's flushed 
        // this can be a gulp plugin, gulp.dest, or any kind of stream 
        // here we use a passthrough stream 
        .pipe(gutil.noop());
});

//build
gulp.task('build', function () {
    return gulp.src('dev/*.html')
        .pipe(useref())
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(gulp.dest('public'));
});

//optimization img
gulp.task('img', () =>
    gulp.src('dev/img/*')
        .pipe(imagemin())
        .pipe(gulp.dest('public/img'))
);

//less to css
gulp.task('less', function(){
	gulp.src('dev/less/style.less')
	.pipe(less())
	.pipe(gulp.dest('dev/css/'));
});

//miniCSS 
gulp.task('minify-css', () => {
  return gulp.src('dev/css/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('public/css/'));
});

//webserver 
gulp.task('webserver', function() {
  gulp.src('dev/')
    .pipe(server({
      livereload: true,
	  port: 8888,
      open: true
    }));
});

//webserver public 
gulp.task('pub', function() {
  gulp.src('public/')
    .pipe(server({
      livereload: true,
	  port: 1111,
      open: true
    }));
});
 
// sass to css 
gulp.task('sass', function () {
  return gulp.src('dev/scss/**/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gcmq())
    .pipe(gulp.dest('dev/css'));
});

//autoprefixer
gulp.task("autoprefixer", function(){
	gulp.src('dev/css/**/*.css')
    .pipe(autoprefixer({
        browsers: ['last 10 versions'],
			cascade: false
    }))
    .pipe(gulp.dest('dev/css/'))
});

//watch
gulp.task('watch', function(){
  gulp.watch('dev/scss/**/*.scss', ['sass']); 
  gulp.watch('dev/less/**/*.less', ['less']); 
  gulp.watch('dev/css/**/*.css', ['autoprefixer']); 
});

gulp.task('default', ['webserver', 'sass', 'watch']);