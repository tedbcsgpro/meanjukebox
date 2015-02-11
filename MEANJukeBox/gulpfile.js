/// <vs AfterBuild='default' Clean='clean' SolutionOpened='clean' />
// include plug-ins
var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')({ lazy: false }),
    path = require('path'),
    del = require('del'),
    es = require('event-stream'),
    buildDir = './',
    srcDir = buildDir + 'Client/',
    express = require('express'),
    app = express(),
    port = process.env.PORT || 8080,
    AUDIO_DIRPATH = 'http://metated.net/audio';



gulp.task('copy-index', ['clean:html', 'clean:js'], function () {
    return gulp.src(srcDir + 'app/index.html')
        .pipe(gulp.dest(buildDir));
});


gulp.task('scripts', ['config', 'copy-index'], function () {
    
    libSrc = [
        srcDir + 'bower_components/angular/angular.js',
        srcDir + 'bower_components/angular-route/angular-route.js',
        srcDir + 'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
        srcDir + 'bower_components/underscore/underscore.js'
    ];
    
    var appStream = gulp.src([srcDir+'/app/js/*.js', srcDir+'/app/app.js'])
        .pipe(plugins.concat('app.js'))
        .pipe(gulp.dest(buildDir + '/js')); 

    var vendorStream = gulp.src(libSrc)
        .pipe(plugins.concat('lib.js'))
        .pipe(gulp.dest(buildDir + '/js'));
        // .pipe(plugins.uglify())

    return gulp.src(buildDir + 'index.html')
        .pipe(plugins.inject(es.merge(vendorStream), { name: 'vendor', relative: true, addRootSlash: true }))
        .pipe(plugins.inject(es.merge(appStream), { name: 'app', relative: true, addRootSlash:true}))
        .pipe(gulp.dest(buildDir))
        .pipe(plugins.connect.reload());

});

gulp.task('css', ['vendorCSS'], function () {
    return gulp.src(srcDir + 'app/app.less')
        .pipe(plugins.less())
        .pipe(plugins.concat('app.css'))
        .pipe(gulp.dest(buildDir + 'css/'))
        .pipe(plugins.connect.reload());
});
gulp.task('vendorCSS', function () {
    //concatenate vendor CSS files
    return gulp.src(['!' + srcDir + 'bower_components/**/*.min.css',
        '!' + srcDir + 'bower_components/bootstrap/**/*.css',
        srcDir + 'bower_components/**/*.css'])
        .pipe(plugins.concat('lib.css'))
        .pipe(gulp.dest(buildDir + 'css/'));
});

gulp.task('clean', ['clean:html', 'clean:js', 'clean:css', 'clean:images'], function () {
    return gulp.src('not-found.txt');
});

gulp.task('clean:html', function () {
    return del.sync([
        buildDir + 'index.html',
    ], { force: true });
});

gulp.task('clean:js', function () {
    return del.sync([
        buildDir + 'config.js',
        buildDir + 'js'], { force: true }); // forcing delete of files outside cwd
});

gulp.task('clean:css', function () {
    return del.sync([
        buildDir + 'css',
        buildDir + 'fonts'
    ], { force: true });
});

gulp.task('clean:images', function () {
    return del.sync([
        buildDir + 'images/app'
    ], { force: true });
});

gulp.task('config', function () {
    var env = plugins.util.env.type ? 'production' : 'develop';
    gulp.src(srcDir + 'app/config.json')
    .pipe(plugins.ngConstant({
        constants: { ENV: env }
    }))
    .pipe(gulp.dest(buildDir));
});


gulp.task('watch', function () {
    gulp.watch([srcDir + 'app/**/*.js', '!' + srcDir + 'app/**/*test.js'], ['scripts']);
    gulp.watch(['!' + srcDir + 'app/index.html', srcDir + 'app/**/*.html'], ['scripts']);
    gulp.watch(srcDir + 'app/**/*.less', ['css']);

    app.use("/", express.static(__dirname));
    app.listen(port);
    console.log('Listening on port ' + port);

});

gulp.task('connect', plugins.connect.server({
    port: 9000,
    livereload: true
}));


gulp.task('default', ['css', 'scripts']);
gulp.task('serve', ['connect', 'default', 'watch']);