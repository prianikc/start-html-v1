"use strict";
const gulp        = require('gulp'),
      sass        = require('gulp-sass'),
      browserSync = require('browser-sync'),
      concat      = require('gulp-concat'),
      uglify      = require('gulp-uglify'),
      cleanCss    = require('gulp-clean-css'),
      rename      = require('gulp-rename'),
      del         = require('del'),
      cache       = require('gulp-cache'),
      prefixer    = require('gulp-autoprefixer'),
      notify      = require('gulp-notify'),
      regger      = require('gulp-rigger'),
      sourcemaps  = require('gulp-sourcemaps');

const helpers = {
  source: function (path) {
    return [paths.src, path].join('/');
  },
  dist: function (path) {
    return [paths.dist, path].join('/');
  },
  vendor: function (path) {
    return [paths.vendor, path].join('/');
  }
};

const theme = './dist',
  paths = {
    src: './app',
    vendor: './node_modules',
    dist: [theme, '/'].join('/'),
    clear: [
      [theme, '/', '**', '*.*'].join('/'),
      '!' + [theme, '/', '/img', '**', '*.*'].join('/')
    ]
  };

const map = [
  {
    type: 'sass',
    src: helpers.source('sass/main.scss'),
    dist: 'css',
    watchFiles: helpers.source('sass/**/*.scss'),
  },
  {
    type: 'content',
    src: helpers.source('img/**/*.*'),
    dist: 'img'
  },
  {
    type: 'content',
    src: [
      helpers.source('fonts/**/*.*'),
      helpers.vendor('font-awesome/fonts/*.*')
    ],
    dist: 'fonts'
  },
  {
    type: 'js',
    src: [
      helpers.vendor('jquery/dist/jquery.min.js'),
      helpers.vendor('tether/dist/js/tether.min.js'),
      helpers.vendor('bootstrap/dist/js/bootstrap.js'),
      helpers.vendor('slick-carousel/slick/slick.min.js'),
      helpers.source('js/app.js')
    ],
    dist: 'js',
    watchFiles: helpers.source('js/**/*.js')
  },
  {
    type: 'html',
    src: [
      helpers.source('*.html'),
      helpers.source('template/*.html')
    ],
    dist: './',
    watchFiles: [
      helpers.source('*.html'),
      helpers.source('template/**/*.html')
    ]
  }
];
const cleanDist = function (dist) {
  del(helpers.dist([dist, '**'].join('/')));
};
const cleanHtml = function (dist) {
  del(helpers.dist([dist, '*.html'].join('/')));
};

const runBrowser = function () {
  
  browserSync({
    server: {
      baseDir: 'dist'
    },
    notify: false,
    // tunnel: true,
    // tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
  });
};

const buildStrategies = function () {
  return {
    sass: buildSass,
    js: buildJs,
    html: buildHtml,
    content: buildContent
  };

  function buildHtml(src, dist) {
    cleanHtml();
    return gulp.src(src)
      .pipe(regger())
      .pipe(gulp.dest(helpers.dist(dist)))
      .pipe(browserSync.reload({stream:true}));
  }

  function buildSass(src, dist) {
    cleanDist(dist);
    return gulp.src(src)
        .pipe(sourcemaps.init())
        .pipe(sass({
          includePaths: ['src/style/'],
          outputStyle: 'compressed',
          sourceMap: true,
          errLogToConsole: true
        }))
        .pipe(rename({suffix: '.min', prefix: ''}))
        .pipe(prefixer())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(helpers.dist(dist)))
        .pipe(browserSync.reload({stream:true}));

  }
  function buildJs(src, dist) {
    cleanDist(dist);
    return gulp.src(src)
      .pipe(concat('scripts.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest(helpers.dist(dist)))
      .pipe(browserSync.reload({stream:true}));

  }
  function buildContent(src, dist) {
    cleanDist(dist);

    gulp.src(src)
      .pipe(gulp.dest(helpers.dist(dist)));
  }
};

gulp.task('browser-sync' , function () {
  runBrowser();
});

gulp.task('clear', function () {
  return del(paths.clear);
});

gulp.task('sass', function () {
  const sass = map.filter(function (node) {
    return node.type === 'sass';
  });

  sass.forEach(function (node) {
    buildStrategies().sass(node.src, node.dist);
  });


});
gulp.task('js', function () {
  const js = map.filter(function (node) {
    return node.type === 'js';
  });

  js.forEach(function (node) {
    buildStrategies().js(node.src, node.dist);
  });


});
gulp.task('content', function () {
  const content = map.filter(function (node) {
    return node.type === 'content';
  });

  content.forEach(function (node) {
    buildStrategies().content(node.src, node.dist);
  });

});
gulp.task('html', function () {
  const html = map.filter(function (node) {
    return node.type === 'html';
  });

  html.forEach(function (node) {
    buildStrategies().html(node.src, node.dist);
  });

});

gulp.task('watch', function () {
  const watchable = map.filter(function (node) {
    return node.type === 'sass' || node.type === 'js' || node.type === 'html';
  });

  watchable.forEach(function (node) {
    let watcher = gulp.watch(node.watchFiles, [node.type]);
    watcher.on('change', function (event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    })
  });
});

gulp.task('build', ['html', 'sass', 'js', 'content', 'browser-sync']);
gulp.task('default', ['build', 'watch']);
