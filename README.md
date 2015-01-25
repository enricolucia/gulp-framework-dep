# gulp-framework-dep
> Configurable dynamic install framework Bower dependencies.

## Usage

First, install `gulp-framework-dep` as a development dependency:

```shell
npm install --save gulp-framework-dep
```

Then, add it to your `gulpfile.js`:

```javascript
var gulp = require('gulp');
var frameworkDep = require('gulp-framework-dep');

gulp.task('default', function() {
  return frameworkDep({
    framework: 'angular' // or backbone or ember or any up to you!
  })
    .pipe(gulp.dest('lib/'))
});
```

This defaults to the directory configured in `./.bowerrc` or to `./bower_components` when no `.bowerrc` could be found.


You can also pass a config Object with all these optional parameters to gulp-framework-dep:

```javascript
var gulp = require('gulp');
var frameworkDep = require('gulp-framework-dep');

gulp.task('default', function() {
  return frameworkDep({
      //framework: 'mvc-sample'
      //path to .bowerrc
       cwd: './',
       //bower folders where to pick files
       directory: './bower_components',
       //pick minified version from bower folders
       minified: true,
       //exclude files from stream
       exclude: ['arg1','arg2','arg3', .....]
 })
    .pipe(gulp.dest('path/'))
});
```




## Changelog

#####0.0.1
- initial release