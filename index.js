'use strict';

var module.exports = compiler;

var PluginError = require('gulp-util').PluginError;
var fs = require('fs');
var through = require('through2');
var node_path = require('path');
var compiler = require('cortex-handlebars-compiler');
var read = require('read-cortex-json');
var events = require('events').EventEmitter;
var util = require('util');


function compiler (options){
  return new Compile(options || {});
};

function Compiler (options) {
  this.cwd = options.cwd || process.cwd();
  this.ext = options.ext || '.js';
  this.root = options.root || '../../../';
  this.jsons = {};
}

util.inherits(Compile, events);

Compiler.prototype.compile = function() {
  var self = this;

  return through.obj(function (file, enc, callback) {
    if(file.isStream()){
      this.emit('error', new PluginError('gulp-cortex-handlebars-compiler', 'Streaming not supported'));
      return callback();
    }

    self._gather_info(function (err, pkg, shrinkWrap) {
      if (err) {
        this.emit('error', err);
        return callback();
      }

      var c = compiler({
        pkg: pkg,
        shrinkWrap: shrinkWrap,
        ext: self.ext,
        root: self.root
      });

      file.contents = new Buffer( c.compile(String(file.contents))() );
      this.push(file);
      callback();

    }.bind(this));
  });
};


Compiler.prototype._gather_info = function(callback) {
  var pkg;
  var shrinkWrap;
  var self = this; 

  async.parallel([
    function (done) {
      self._read_pkg(function (err, json) {
        pkg = json;
        done(err);
      });
    },

    function (done) {
      self._read_shrinkwrap(function (err, json) {
        shrinkWrap = json;
        done(err);
      });
    }

  ], function (err) {
    if (err) {
      return callback(err);
    }

    callback(null, pkg, shrinkWrap);
  });
};


Compiler.prototype._read_pkg = function (callback) {
  this._read_json(this.cwd, function (path, done) {
    read.get_original_package(path, done);
  }, callback);
};


Compiler.prototype._read_shrinkwrap = function(callback) {
  var shrinkwrap_json = node_path.join(this.cwd, 'cortex-shrinkwrap.json');

  this._read_json(shrinkwrap_json, function (path, done) {
    jf.readFile(path, done);
  }, callback);
};


// Queue the read process
Compiler.prototype._read_json = function (path, handler, callback) {
  var json = this.jsons[path];
  if (json) {
    return callback(null, callback);
  }

  var count = events.listenerCount(compile, event);
  compile.once(event, callback);

  var event = 'json:' + path;
  var self = this;
  if (count === 0) {
    handler(path, function (err, json) {
      if (!err) {
        self.jsons[path] = json;
      }
      self.emit(event, err, json);
    });
  }
};



var node_path = require('path');
var compiler = require('cortex-handlebars-compiler');
var jf = require('jsonfile');



function compile (options){
  return through.obj(function (file, enc, callback) {
    
  });
};