var gulp = require('gulp');
var psi = require('psi');
var site = 'http://www.html5rocks.com';
var key = '';
var sass = require('gulp-ruby-sass');
var critical = require('critical');
// load plugins
var $ = require('gulp-load-plugins')();

gulp.task('styles', function(){
    return sass('src/static/styles/', {
        style: 'expanded',
        stopOnError: true,
        cacheLocation: './'
        })
        .pipe($.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
        .pipe(gulp.dest('.tmp/static/styles'))
        .pipe($.size());
});

/*gulp.task('styles', function () {
    return gulp.src('src/static/styles/style.css')
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('.tmp/static/styles'))
        .pipe($.size());
});*/

gulp.task('scripts', function () {
    return gulp.src('src/static/scripts/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter(require('jshint-stylish')))
        .pipe($.size());
});

var jscs = require('gulp-jscs');
var gulpFilter = require('gulp-filter');

gulp.task('test', function () {
    // create filter instance inside task function
    // create filter instance inside task function
    var filter = gulpFilter(['*', '!src/vendor'], {restore: true});

    return gulp.src('src/**/*.js')
        // filter a subset of the files
        .pipe(filter)
        // run them through a plugin
        // bring back the previously filtered out files (optional)
        .pipe(filter.restore)
        .pipe(gulp.dest('dist'));

});

gulp.task('html', ['styles', 'scripts'], function () {
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');
    var assets = $.useref.assets({searchPath: '{.tmp,src}'});

    return gulp.src('src/*.html')
        .pipe(assets)
        .pipe(jsFilter)
        .pipe($.uglify())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe(gulp.dest('dist'))
        .pipe($.size());
});

gulp.task('images', function () {
    return gulp.src('src/static/images/**/*')
        .pipe($.cache($.imagemin({
            optimizationLevel: 5,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/static/images'))
        .pipe($.size());
});

/*gulp.task('fonts', function () {
    return gulp.src(require('main-bower-files')().concat('src/static/fonts/!**!/!*'))
        .pipe($.filter('**!/!*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest('dist/static/fonts'))
        .pipe($.size());
});*/

gulp.task('extras', function () {
    return gulp.src(['src/*.*', '!src/*.html'], { dot: true })
        .pipe(gulp.dest('dist'));
});


gulp.task('clean', function () {
    return gulp.src(['.tmp', 'dist'], { read: false }).pipe($.clean());
});

gulp.task('build', ['html', 'images', 'extras']);

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

gulp.task('connect', function () {
    var connect = require('connect'),
        serveStatic = require('serve-static'),
        serveIndex = require('serve-index');
    var app = connect()
        .use(require('connect-livereload')({ port: 35729 }))
        .use(serveStatic('src'))
        .use(serveStatic('.tmp'))
        .use(serveIndex('src'));

    require('http').createServer(app)
        .listen(9000)
        .on('listening', function () {
            console.log('Started connect web server on http://localhost:9000');
        });
});

gulp.task('serve', ['connect'], function () {
    require('opn')('http://localhost:9000');
});

// Copy our site styles to a site.css file
// for async loading later
gulp.task('copystyles', function () {
    return gulp.src(['dist/static/styles/before-prefix/style.css'])
        .pipe($.rename({
            basename: "site"
        }))
        .pipe(gulp.dest('dist/static/styles'));
});


// Generate & Inline Critical-path CSS
//gulp.task('critical', ['build', 'copystyles'], function (cb) {
gulp.task('critical', function (cb) {

    // At this point, we have our
    // production styles in main/styles.css

    // As we're going to overwrite this with
    // our critical-path CSS let's create a copy
    // of our site-wide styles so we can async
    // load them in later. We do this with
    // 'copystyles' above

    critical.generate({
        base: 'dist/',
        src: 'main.html',
        dest: 'dist/static/styles/site.min.css',
        width: 320,
        height: 480

        //minify: true,


    }).then(function(output){

        critical.inline({
            base: 'dist/',
            src: 'main.html',
            dest: 'dist/index.html',
            minify: true
        });
    }).error(function(err){
        console.log(err.message);
    });
});


// inject bower components
gulp.task('wiredep', function () {
    var wiredep = require('wiredep').stream;

    gulp.src('app/*.html')
        .pipe(wiredep({
            directory: 'app/bower_components'
        }))
        .pipe(gulp.dest('app'));
});

gulp.task('watch', ['connect', 'serve'], function () {
    var server = $.livereload();

    // watch for changes

    gulp.watch([
        'app/*.html',
        '.tmp/styles/**/*.css',
        'app/scripts/**/*.js',
        'app/images/**/*'
    ]).on('change', function (file) {
        server.changed(file.path);
    });

    gulp.watch('app/styles/**/*.css', ['styles']);
    gulp.watch('app/scripts/**/*.js', ['scripts']);
    gulp.watch('app/images/**/*', ['images']);
    gulp.watch('bower.json', ['wiredep']);
});



// Please feel free to use the `nokey` option to try out PageSpeed
// Insights as part of your build process. For more frequent use,
// we recommend registering for your own API key. For more info:
// https://developers.google.com/speed/docs/insights/v1/getting_started

gulp.task('mobile', function () {
    return psi(site, {
        // key: key
        nokey: 'true',
        strategy: 'mobile'
    }, function (err, data) {
        console.log(data.score);
        console.log(data.pageStats);
    });
});

gulp.task('desktop', function () {
    return psi(site, {
        nokey: 'true',
        // key: key,
        strategy: 'desktop'
    }, function (err, data) {
        console.log(data.score);
        console.log(data.pageStats);
    });
});

gulp.task('default', ['critical']);