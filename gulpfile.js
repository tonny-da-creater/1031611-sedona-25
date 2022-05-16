import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import del from 'del';
import browser from 'browser-sync';

// Styles

export const styles = () => {
  return gulp.src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// HTML

const html = () => {
  return gulp.src('source/*.html')
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest('build'))
}

const scripts = () => {
  return gulp.src('source/js/script.js')
  .pipe(terser())
  .pipe(gulp.dest('build/js'))
  .pipe(browser.stream());
}

// images

const optimizeImages = () => {
  return gulp.src('source/img/**/1.{jpg, png}')
  .pipe(squoosh())
  .pipe(gulp.dest('build/img'))
}

const copyImages = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
  .pipe(gulp.dest('build/img'))
  }


// WebP

const createWebp = () => {
  return gulp.src('source/img/**/1.{jpg, png}')
  .pipe(squoosh({
    webp: {}
  }))
  .pipe(gulp.dest('build/img'))
}

// SVG

const svg = () => {
  return gulp.src('source/img/*.svg')
  .pipe(svgo())
  .pipe(gulp.dest('build/img'))
}

// const sprite = () => {
//   return gulp.src('source/img')
// }

// Copy

const copy = (done) => {
  gulp.src([
  'source/fonts/*.{woff2,woff}',
  'source/*.ico',
  ], {
  base: 'source'
  })
  .pipe(gulp.dest('build/fonts'))
  done();
  }

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'source'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Clean

const clean = () => {
  return del('build');
};

// Reload

const reload = (done) => {
  browser.reload();
  done();
  }

// Watcher

const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch('source/*.html').on('change', browser.reload);
  gulp.watch('source/js/script.js', gulp.series(scripts));
}


export const build = gulp.series(
  // clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    createWebp
  )
);

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
  styles,
  html,
  scripts,
  svg,
  // sprite,
  createWebp
  ),
  gulp.series(
  server,
  watcher
  ));
