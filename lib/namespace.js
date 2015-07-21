'use strict';

var fs = require('fs'),
    path = require('path');

function Namespace() {
  this.hooks = {};
}

Namespace.prototype.load = function (folder) {
  var self = this;

  var files = fs.readdirSync(folder);

  files.forEach(function (file) {
    var fileHooks = require(path.join(folder, file));

    Object.keys(fileHooks).forEach(function (hookName) {
      self.hooks[hookName] = fileHooks[hookName];
    });
  });
};

module.exports = Namespace;
