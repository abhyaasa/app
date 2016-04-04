'use strict';

/* begin configuration variables */

var cmdAliases = {
    help: 'gulp cmd',
    cd1: 'cd data/cdecks/test; update.sh deck1',
    cd2: 'cd data/cdecks/test; update.sh deck_2',
    ct: 'cd scripts; cdeck.py -t -m "prefix"',
    si: 'gulp si -i',
    sa: 'gulp si -a',
    sl: 'gulp si -l',
    bi: 'gulp build',
    ba: 'gulp build -a',
    ei: 'gulp default; ionic emulate ios -lcs',
    ri: 'gulp default; ionic run ios -lcs',
    ra: 'gulp default; ionic run android -cs',
    bx: 'gulp bx'
};

var paths = {
    scss: ['./scss/**/*.scss'],
    appJs: ['./www/**/*.js', '!./www/lib/**'],
    py: ['scripts/*.py'],
    xhtml: ['config.xml', 'index.html', 'www/views/**/*.html'],
    projectJson: ['./ionic.project', './.htmlhintrc', '.jsbeautifyrc', '.jshintrc',
        '.xmlhintrc', './**/*.json', '!www/lib/**', '!./node_modules/**/*.json',
        '!./plugins/**/*.json', '!./platforms/**/*.json'
    ]
};
paths.indexJs = paths.appJs.concat(['!./www/js/app.js', '!./www/**/*spec.js']);
paths.projectJs = paths.appJs.concat(['./*.js', './config/*.js', './doc/*.js']);

var configJsonFile = 'www/data/config.json';

var devBrowser = ' --browser /Applications/Google\\ Chrome\\ Canary.app';

/* end configuration variables */

// NOTE: All synchronous tasks (to be completed before their dependents run) use 'done'
// callback and do not return their stream.

var gulp = require('gulp-help')(require('gulp'));
var gutil = require('gulp-util');
var sh = require('shelljs');
var _ = require('underscore');
var replace = require('gulp-replace');
var fs = require('fs');
var debug = require('gulp-debug');
// var concat = require('gulp-concat'); # in devDependencies, but not used
var argv = require('minimist')(process.argv.slice(2));
var plumber = require('gulp-plumber');
var jshint = require('gulp-jshint');
var spy = require('through2-spy');
var debug = require('gulp-debug');
var exec = require('gulp-exec');

// from https://www.timroes.de/2015/01/06/proper-error-handling-in-gulp-js/
var gulp_src = gulp.src;
gulp.src = function () {
    return gulp_src.apply(gulp, arguments)
        .pipe(plumber(function (error) {
            gutil.log(gutil.colors.red('Error (' + error.plugin + '): ' + error.message));
            this.emit('end'); // emit the end event, to properly end the task
        }));
};

var cwd = process.cwd();

var logError = function () {
    gutil.log(gutil.colors.magenta(Array.prototype.slice.call(arguments).join(' ')));
};

// handly for stream debugging, e.g. .pipe(makeObjSpy('KEYS', _.keys))
var makeObjSpy = function (name, fn) {
    return spy.obj(function (obj) {
        gutil.log('SPY', name, fn(obj));
    });
};

gulp.task('default',
    'Run by ionic app build and serve commands', ['sass', 'index', 'md', 'lint']
);

gulp.task('sass', 'Ionic .scss to .css file transformation', function (done) {
    var sass = require('gulp-sass');
    var minifyCss = require('gulp-minify-css');
    var rename = require('gulp-rename');
    gulp.src('./scss/ionic.app.scss')
        .pipe(sass())
        .on('error', sass.logError)
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

gulp.task('watch', 'Only watches scss files.', function () {
    return gulp.watch(paths.sass, ['sass']);
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

gulp.task('index', 'Inject script elements into www/index.html',
    function () {
        var inject = require('gulp-inject');
        var injector = function (paths) {
            return inject(gulp.src(paths, {
                    read: false
                }), // .pipe(debug())
                {
                    relative: true
                });
        };
        sh.cp('-f', './index.html', './www/index.html');
        return gulp.src('./www/index.html')
            .pipe(injector(paths.indexJs))
            // .pipe(debug())
            .pipe(gulp.dest('./www'));
    });

gulp.task('flavor',
    '--name FLAVOR : inject FLAVOR into ' + configJsonFile +
    ' and link ./resources to data/flavors/FLAVOR/resources',
    function (done) {
        if (!argv.name) {
            logError('Usage: gulp flavor --name NAME');
        } else {
            var configJson = JSON.parse(fs.readFileSync(configJsonFile).toString());
            configJson.flavor = argv.name;
            fs.writeFileSync(configJsonFile, JSON.stringify(configJson, null, 2));
            sh.exec('rm -rf www/data/flavor');
            sh.exec('ln -sf `pwd`/data/flavors/' + argv.name + ' www/data/flavor');
            sh.exec('ln -sf data/flavors/' + argv.name + '/resources .');
        }
        done();
    });

gulp.task('md', 'Process markdown files', function () {
    var markdown = require('gulp-markdown');
    sh.exec('rm -rf ./www/data/md');
    return gulp.src('./data/md/*.md')
        .pipe(markdown())
        .pipe(gulp.dest('./www/data/md'));
});

gulp.task('si',
    '[-a|-i|-l] : serve ionic for android, ios, or both, with devBrowser, or default: ' +
    'serve ios with default browser', ['default'],
    function () {
        var platform = argv.a ? '-t android' + devBrowser :
            argv.i ? '-t ios' + devBrowser :
            argv.l ? '-l' : '';
        var command = 'ionic serve -c ' + platform;
        sh.exec(command);
    });

gulp.task('build', '[-a] for Android, default iOS', ['default'], function (done) {
    sh.exec('ionic build ' + (argv.a ? 'android' : 'ios'));
    if (!argv.a) {
        gulp.src(['./platforms/ios/*/config.xml'])
            .pipe(replace(/<allow-navigation.*\/>/, ''))
            .pipe(gulp.dest('./platforms/ios'));
    }
    logError('If build did not end with "** BUILD SUCCEEDED **", run it again!');
    done();
});

gulp.task('bx', 'Build for ios and open xcode project', ['build'], function (done) {
    sh.exec('open platforms/ios/*.xcodeproj');
    done();
});


gulp.task('publish-pre-build', 'Execute before publishing build.', function () {
    // PUBLISH pref-building tasks: see https://github.com/leob/ionic-quickstarter
    // use https://github.com/scniro/gulp-clean-css
});

gulp.task('dgeni', 'Generate jsdoc documentation.', function (done) {
    // from https://github.com/petebacondarwin/dgeni-example, for doc tags see
    // https://github.com/angular/angular.js/wiki/Writing-AngularJS-Documentation and
    // http://www.chirayuk.com/snippets/angularjs/ngdoc
    var Dgeni = require('dgeni');
    var dengiPackage = require('./docs/dgeni-package');
    try {
        var dgeni = new Dgeni([dengiPackage]);
        return dgeni.generate();
    } catch (x) {
        gutil.log(x.stack);
        throw x;
    }
    done();
});

gulp.task('cmd', '[-a ALIAS] : Execute shell command named ALIAS in aliases dictionary' +
    ', default: list aliases',
    function () {
        if (!argv.a) {
            _.forEach(cmdAliases, function (value, key) {
                gutil.log(key, ':', value);
            });
        } else {
            var cmd = cmdAliases[argv.a];
            gutil.log('exec command:', cmd);
            sh.exec(cmd);
        }
    });

gulp.task('bump', '[-v VERSION | -t (major | minor | patch | (prerelease [-n NAME])] : ' +
    'Change app version to VERSION or to result of bumping of given type (-t, default ' +
    'prerelease), and create annotated git tag.',
    function (done) {
        var bump = require('gulp-bump');
        var semver = require('semver');
        fs.readFile('./package.json', function (err, data) {
            var version = JSON.parse(data).version;
            var newVersion = argv.v;
            if (!argv.v) {
                if (!argv.t) {
                    argv.t = 'prerelease';
                }
                newVersion = semver.inc(version, argv.t, argv.n);
            }
            gutil.log('Bumping version ' + version + ' to ' + newVersion);
            var versionObj = {
                version: newVersion
            };
            gulp.src(['./package.json'])
                .pipe(bump(versionObj))
                .pipe(gulp.dest('./'));
            gulp.src(['./www/data/config.json'])
                .pipe(bump(versionObj))
                .pipe(gulp.dest('./www/data'));
            gulp.src(['./config.xml'])
                .pipe(replace(/(<widget.*version=")[^"]*/, '$1' + newVersion))
                .pipe(gulp.dest('./'));
            sh.exec('git tag -a v' + newVersion + ' -m "version ' + newVersion + '"');
        });
        done();
    });

// ------------------ Linting tasks ----------------------------------------

gulp.task('lint',
    'Run all js, json, scss, and html/xml file problem reporters.', [
        'jshint', 'jscs', 'jsonlint', 'scsslint', 'xhtmllint', 'pylint'
    ]
);

var linterErrorExit = function (linterKey) {
    return spy.obj(function (obj) {
        if (!obj[linterKey].success) {
            logError('LINTER ERROR EXIT:', linterKey);
            process.exit(1);
        }
    });
};

var execErrorExit = function (linterName) {
    return spy.obj(function (obj) {
        if (obj.exec.stderr) {
            logError('LINTER ERROR EXIT:', linterName);
            process.exit(1);
        }
    });
};

gulp.task('eslint', 'Report js file problems.', function () {
    var eslint = require('gulp-eslint');
    gulp.src(paths.projectJs)
        .pipe(eslint({
            configFile: 'config/eslintrc.yml'
        }))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('jshint', 'Report more serious js file problems.', function (done) {
    gulp.src(paths.projectJs)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(linterErrorExit('jshint'))
        .on('finish', done);
});

gulp.task('scsslint', 'Report scss file problems.', function (done) {
    var scssLint = require('gulp-scss-lint');
    gulp.src(paths.scss)
        .pipe(scssLint({
            config: cwd + '/config/scss-lint.yml'
        }))
        .pipe(linterErrorExit('scsslint'))
        .on('finish', done);
});

gulp.task('jscs', 'Report js file style problems.', function (done) {
    var jscs = require('gulp-jscs');
    var stylish = require('gulp-jscs-stylish');
    gulp.src(paths.projectJs)
        .pipe(jscs({
            configPath: 'config/jscsrc'
        }))
        .pipe(stylish())
        .pipe(linterErrorExit('jscs'))
        .on('finish', done);
});

gulp.task('jsonlint', 'Report json file problems.', function () {
    var jsonlint = require('gulp-json-lint');
    var isError = function (errorValue) {
        // avoid jsonlint bug: https://github.com/codenothing/jsonlint/issues/2
        return (errorValue !== undefined &&
            errorValue !== 'Invalid Reverse Solidus \'\\\' declaration.');
    };
    var reporter = function (jsonLintObj, file) {
        if (isError(jsonLintObj.error)) {
            gutil.log(file.path + ': ' + jsonLintObj.error);
        }
    };
    var jsonErrorExit = function () {
        return spy.obj(function (obj) {
            if (isError(obj.jsonlint.error)) {
                logError('LINTER ERROR EXIT:', 'jsonlint');
                process.exit(1);
            }
        });
    };
    return gulp.src(paths.projectJson) // FIXME remove return when on 'finish' fixed
        .pipe(jsonlint())
        .pipe(jsonlint.report(reporter))
        .pipe(jsonErrorExit())
        // .on('finish', done) // done not invoked
    ;
});

gulp.task('xhtmllint', 'Report html file problems.', function (done) {
    gulp.src(paths.xhtml)
        .pipe(exec('scripts/tidylint.py <%= file.path %>'))
        .pipe(exec.reporter())
        .pipe(execErrorExit('xhtmllint'))
        .on('finish', done);
});

gulp.task('pylint', 'Report python file problems.', function (done) {
    gulp.src(paths.py)
        .pipe(exec('flake8 --config=config/flake8 --exit-zero <%= file.path %> 1>&2'))
        .pipe(exec.reporter())
        .pipe(execErrorExit('pylint'))
        .on('finish', done);
});

gulp.task('test', 'Run some gulp development test.', ['eslint'],
    function () {
        gutil.log('TESTING');
    });

// ------------------ Testing tasks -------------------------------------

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
    return gulp.src([])
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: 'watch'
        }));
});

gulp.task('itest', 'Integration (e-e) tests', function (done) {
    // FUTURE itest not working
    var mkCmd = function (cmd) {
        return 'scripts/term.sh "cd ' + cwd + ';' + cmd + '"';
    };
    sh.exec(mkCmd('ionic serve -c -t ios ' + devBrowser));
    sh.exec('sleep 10');
    sh.exec(mkCmd('webdriver-manager start'));
    sh.exec('sleep 3');
    sh.exec(mkCmd('protractor protractor.conf.js'));
    done();
});
