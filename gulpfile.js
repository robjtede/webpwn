'use strict'

const gulp = require('gulp')
const livereload = require('gulp-livereload')
const cache = require('gulp-cached')

const paths = {
  dist: './dist',
  src: './src',

  markup: ['./views/**/*.pug'],
  public: ['./public/**/*.{css, js}']
}

// Observe Tasks
gulp.task('public', () => {
  return gulp.src(paths.public)
    .pipe(cache('public'))
    .pipe(livereload())
})

gulp.task('markup', () => {
  return gulp.src(paths.markup)
    .pipe(cache('markup'))
    .pipe(livereload())
})

// Watch tasks
gulp.task('observe', () => {
  livereload.listen()

  gulp.watch(paths.markup, ['markup'])
  gulp.watch(paths.public, ['public'])
})

gulp.task('watch', ['build', 'observe'])
gulp.task('default', ['observe'])
