/*global require*/
/*global module*/
/*global process*/
var _ = require('underscore');
var fs = require('fs');
var gutil = require('gulp-util');
var path = require('path');
var transform = require('vinyl-fs');
_.Str = require('underscore.string');
var frameworkRegExp;

var handleError = function(message) {
  gutil.log(gutil.colors.red(message));
  this.end();
};

//--------------SAMPLE CONFIG-----------------//
// var config = {                             //
//       cwd: './',                           //
//       directory: './bower_components',     //
//       framework: 'angular',                //
//       minified: true,                      //
//       exclude: ['framework-first',..,]     //
//       include: ['framework-first',..,]     //
// };                                         //
//--------------SAMPLE CONFIG-----------------//

module.exports = function (opts) {
  opts = opts || {exclude: []};
  opts.exclude = opts.exclude || '';
  opts.include = opts.include || '';
  opts.cwd = opts.cwd ?  path.join(process.cwd(), opts.cwd) : process.cwd();
  frameworkRegExp = new RegExp(opts.framework, 'gi');

  if (!opts.directory) {
    var bowerrc = path.join(opts.cwd, '.bowerrc');
    if (fs.existsSync(bowerrc)) {
      var bower_config = JSON.parse(fs.readFileSync(bowerrc));
      opts.directory = bower_config.directory;
    }
    opts.directory = opts.directory || './bower_components';
  }

  var builder = function(){
    gutil.log("Using cwd: ", opts.cwd);
    gutil.log("Using bower dir: ", opts.directory);
    var bowerFile = require(path.join(opts.cwd, './bower.json'));
    var bowerPackages = bowerFile.dependencies;
    var bowerDir = opts.directory;
    var packagesOrder = [];
    var mainFiles = [];

    // Function for adding package name into packagesOrder array in the right order
    function addPackage(name){
      // package info and dependencies
      var info = require(path.join(opts.cwd, bowerDir + '/' + name + '/bower.json'));
      var dependencies = info.dependencies;

      // add dependencies by repeat the step
      if (!!dependencies) {
        _.each(dependencies, function(value, key){
          if (opts.exclude.indexOf(key) === -1 || opts.include.indexOf(key) !== -1) {
            addPackage(key);
          }
        });
      }

      // and then add this package into the packagesOrder array if they are not exist yet
      if (packagesOrder.indexOf(name) === -1) {
        packagesOrder.push(name);
      }
    }

    // calculate the order of packages
    _.each(bowerPackages, function(value, key){
      if (key.match(frameworkRegExp) || opts.include.indexOf(key) !== -1) {
        if (opts.exclude.indexOf(key) === -1) { // add to packagesOrder if it's not in exclude
          addPackage(key);
        }
      }
    });

    // get the main files of packages base on the order
    _.each(packagesOrder, function(bowerPackage){
      var info = require(path.join(opts.cwd, bowerDir + '/' + bowerPackage + '/bower.json'));
      var main = info.main;
      var mainFile = main;
      var oldMainFile;
      var minified = false;

      // get only the .js file if mainFile is an array
      if (_.isArray(main)) {
        _.each(main, function(file){
          if (_.Str.endsWith(file, '.js')) {
            mainFile = file;
          }
        });
      }

      if (opts.minified) {
        var minifiedFile = main.split('.js')[0];
        oldMainFile = mainFile;
        mainFile = minifiedFile + '.min.js';
      }

      mainFile = bowerDir + '/' + bowerPackage + '/' + mainFile;


      // only add the main file if it's a js file
      if (_.Str.endsWith(mainFile, '.js')) {
        mainFiles.push(mainFile);
      }

    });
    // run the vinyl-stream stream
    return transform.src(mainFiles);

  };

  return builder();
};
