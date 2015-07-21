'use strict';

var fs = require('fs'),
    path = require('path');

function Namespace() {
  this.hooks = {};
}

Namespace.prototype.load = function (folder) {
  var self = this;

  fs.readdirSync(folder, function (err, files) {
    if (err) {
      throw new Error();
    }

    files.forEach(function (file) {
      var fileHooks = require(path.join(folder, file));

      Object.keys(fileHooks).forEach(function (hookName) {
        self.hooks[hookName] = fileHooks[hookName];
      });
    });
  });
};

module.exports = Namespace;
