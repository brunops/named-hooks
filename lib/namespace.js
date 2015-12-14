'use strict';

var fs = require('fs'),
    path = require('path'),
    debug = require('debug')('named-hooks:namespace');

function Namespace() {
  this.hooks = {};
}

Namespace.prototype.load = function (folder) {
  var self = this,
      folder = path.resolve(folder),
      files = fs.readdirSync(folder);

  files.forEach(function (file) {
    var filePath = path.join(folder, file);

    // ignore directories
    if (fs.lstatSync(filePath).isDirectory()) {
      return;
    }

    var fileHooks = require(path.join(folder, file));

    Object.keys(fileHooks).forEach(function (hookName) {
      self.hooks[hookName] = fileHooks[hookName];
      debug('loaded named-hook "%s" from "%s"', hookName, file);
    });
  });
};

module.exports = Namespace;
