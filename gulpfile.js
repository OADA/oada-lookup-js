/* Copyright 2014 Open Ag Data Alliance
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');
var del = require('del');
var beep = require('beepbeep');

var files = {
  gulpfile: ['gulpfile.js'],
  source: [ 'lookup.js' ],
  tests: ['test/**/*.js'],
};

gulp.task('default', ['lint', 'style', 'test', 'watch']);

gulp.task('lint', function() {
  return gulp.src(Array.prototype.concat.apply([],
    [
      files.gulpfile,
      files.source,
      files.tests
    ]))
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('style', function() {
  return gulp.src(Array.prototype.concat.apply([],
    [
      files.gulpfile,
      files.source,
      files.tests
    ]))
    .pipe(jscs());
});

gulp.task('test', function() {
  return gulp.src(files.tests)
    .pipe(mocha({reporter: 'spec'}));
});

gulp.task('cover', function(done) {
  gulp.src(files.source)
    .pipe(istanbul({includeUntested: true}))
    .on('finish', function() {
      gulp.src(files.tests)
        .pipe(mocha())
        .on('error', function() {})
        .pipe(istanbul.writeReports({
          dir: './coverage',
          reporters: ['lcov', 'text', 'text-summary']
        }))
        .on('end', done);
    });
});

gulp.task('clean', function(done) {
  del(['./coverage'], done);
});

gulp.task('watch', function() {
  gulp.watch(Array.prototype.concat.apply([],
    [
      files.gulpfile,
      files.source,
      files.tests
    ]), ['test', 'lint', 'style']);
});

gulp.task('watch:cover', function() {
  gulp.watch(Array.prototype.concat.apply([],
    [
      files.gulpfile,
      files.source,
      files.tests
    ]), ['cover', 'lint', 'style']);
});

/// Helpers
require('better-stack-traces').install({
  collapseLibraries: /node_modules/
});

gulp.on('err', function() {
  beep(1);
});
