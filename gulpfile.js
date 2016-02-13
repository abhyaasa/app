'use strict';

var cmdAliases = {
    cd: 'cd data/cdecks/test; update.sh deck_2',
    ct: 'cd scripts; cdeck.py -t -m "prefix"',
    up: './scripts/upload.sh',
    si: 'gulp is -i',
    bi: 'gulp build',
    ei: 'ionic emulate ios -l -c -s',
    ri: 'ionic run ios -l -c -s --device',
    ta: './scripts/testapp.sh',
    sc: './scripts/scapp.sh'
};

var paths = {
    sass: ['./scss/**/*.scss'],
    appJs: ['./www/**/*.js', '!./www/lib/**']
};

paths.indexJs = paths.appJs.concat(['!./www/js/app.js', '!./www/**/*spec.js']);

var configJsonFile = 'www/data/config.json';

var ionicBrowser = ' --browser /Applications/Google\\ Chrome\\ Canary.app';

var gulp = require('gulp-help')(require('gulp'));
var gutil = require('gulp-util');
var bower = require('bower');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var _ = require('underscore');
var bump = require('gulp-bump');
var replace = require('gulp-replace');
var fs = require('fs');
var markdown = require('gulp-markdown');
// var concat = require('gulp-concat'); # included in devDependencies, but not used

var argv = require('minimist')(process.argv.slice(2));

gulp.task('default', 'Run by ionic app build and serve commands',
    ['sass', 'index', 'md', 'jshint']);

gulp.task('sass', 'Ionic .scss to .css file transformation', function (done) {
    gulp.src('./scss/ionic.app.scss')
        .pipe(sass())
        .pipe(gulp.dest('./www/css/'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(gulp.dest('./www/css/'))
        .on('end', done);
});

gulp.task('watch', 'Only watches sass files.', function () {
    gulp.watch(paths.sass, ['sass']);
});

// For Ionic >= 1.2 http://www.typescriptlang.org
// add to paths something like src: ['./src/*.ts'], // for typescript compilation
// gulp.task('compile', 'Typescript compilation', function () {
//     gulp.src(paths.src)
//         .pipe(typescript({
//             emitError: false
//         }))
//         .pipe(gulp.dest('www/js/'));
// });

gulp.task('index', 'Inject script and css elements into www/index.html',
    // after http://digitaldrummerj.me/gulp-inject/
    function () {
        var ginject = require('gulp-inject');
        sh.cp('-f', './index.html', './www/index.html');
        return gulp.src('./www/index.html')
            .pipe(ginject(
                gulp.src(paths.indexJs, {
                    read: false
                }), {
                    relative: true
                }))
            .pipe(gulp.dest('./www'));
    });

gulp.task('flavor',
    '--name FLAVOR : inject FLAVOR into ' + configJsonFile +
    ' and link ./resources to data/flavors/FLAVOR/resources',
    function () {
        var fs = require('fs');
        if (!argv.name) {
            console.log(gutil.colors.magenta('Usage: gulp flavor --name NAME'));
        } else {
            var configJson = JSON.parse(fs.readFileSync(configJsonFile).toString());
            configJson.flavor = argv.name;
            fs.writeFileSync(configJsonFile, JSON.stringify(configJson, null, 2));
            sh.exec('rm -rf www/data/flavor');
            sh.exec('ln -sf `pwd`/data/flavors/' + argv.name + ' www/data/flavor');
            sh.exec('ln -sf data/flavors/' + argv.name + '/resources .');
            // build resources/{ios/,android/} and update config.xml
            sh.exec('ionic resources');
        }
    });

gulp.task('md', 'Process markdown files', function () {
    sh.exec('rm -rf ./www/data/md_html');
    gulp.src('./data/md/*.md')
        .pipe(markdown())
        .pipe(gulp.dest('./www/data/md_html'));
});

gulp.task('is',
    '[-a|-i|-l] : ionic serve for android, ios, or (default) both', ['default'],
    function () {
        var platform = argv.a ? '-t android' + ionicBrowser :
            argv.i ? '-t ios' + ionicBrowser :
            argv.l ? '-l' : '';
        var command = 'ionic serve -c ' + platform;
        sh.exec(command);
    });

gulp.task('build', '[-a] for Android, default iOS', ['jscs'], function () {
    // BUILD finish this: see https://github.com/leob/ionic-quickstarter
    sh.exec('ionic build ' + (argv.a ? 'android' : 'ios'));
});

gulp.task('jscs', 'Run jscs linter on all (non-lib) script files', function () {
    var jscs = require('gulp-jscs');
    gulp.src(paths.appJs)
        .pipe(jscs())
        .pipe(jscs.reporter());
});

gulp.task('jshint', 'Run jshint on all (non-lib) script files', function () {
    var jshint = require('gulp-jshint');
    gulp.src(paths.appJs)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('publish-pre-build', 'Execute before publishing build', function () {
    // PUBLISH gulp publishing tasks
});

gulp.task('dgeni', 'Generate jsdoc documentation.', function () {
    // FUTURE consider https://www.npmjs.com/package/d2doc-dgeni-packages
    var Dgeni = require('dgeni');
    try {
        var dgeni = new Dgeni([require('./docs/dgeni-package')]);
        return dgeni.generate();
    } catch (x) {
        console.log(x.stack);
        throw x;
    }
});

gulp.task('cmd', '[-a ALIAS] : Execute shell command named ALIAS in aliases dictionary' +
    ', default: list aliases',
    function () {
        if (!argv.a) {
            _.forEach(cmdAliases, function (value, key) {
                console.log(key, ':', value);
            });
        } else {
            var cmd = cmdAliases[argv.a];
            console.log('exec command:', cmd);
            sh.exec(cmd);
        }
    });

gulp.task('set-version', '-v VERSION : Change app version references to VERSION, ' +
    'and create annotated git tag.',
    function () {
        fs.readFile('./package.json', function (err, data) {
            var version = JSON.parse(data).version;
            console.log('Setting version ' + version + ' to ' + argv.v);
            gulp.src(['./www/data/config.json', './package.json'])
                // see https://www.npmjs.com/package/gulp-bump
                .pipe(bump({
                    version: argv.v
                }))
                .pipe(gulp.dest('./'));
            gulp.src(['./config.xml'])
                .pipe(replace(/(<widget.*version=")[^"]*/, '$1' + argv.v))
                .pipe(gulp.dest('./'));
        });
        sh.exec('git tag -a v' + argv.v + ' -m "version ' + argv.v + '"');
    });

// ------------------ Testing tasks follow -------------------------------------
// utest and karma tasks adapted from https://www.npmjs.com/package/gulp-karma,
// but can't find angular if files provided in gulp.src instead of karma.conf.

gulp.task('utest',
    'Single unit test karma run; [-m PATTERN] argument limits ' +
    'tests to it functions with message string matching PATTERN.',
    function () {
        var karma = require('gulp-karma');
        // Be sure to return the stream.
        // See http://stackoverflow.com/questions/8527786 Rimian post.
        return gulp.src([])
            .pipe(karma({
                configFile: 'karma.conf.js',
                client: {
                    args: ['--grep', argv.m]
                },
                action: 'run'
            }))
            .on('error', function (err) {
                // Make sure failed tests cause gulp to exit non-zero
                throw err;
            });
    });

gulp.task('karma', 'Run karma in watch mode.', function () {
    var karma = require('gulp-karma');
    gulp.src([])
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: 'watch'
        }));
});

gulp.task('itest', 'Integration (e-e) tests', function () {
    // FUTURE itest not working
    var cwd = process.cwd();
    var mkCmd = function (cmd) {
        return 'scripts/term.sh "cd ' + cwd + ';' + cmd + '"';
    };
    sh.exec(mkCmd('ionic serve -c -t ios ' + ionicBrowser));
    sh.exec('sleep 10');
    sh.exec(mkCmd('webdriver-manager start'));
    sh.exec('sleep 3');
    sh.exec(mkCmd('protractor protractor.conf.js'));
});
