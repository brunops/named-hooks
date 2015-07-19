'use strict';

var fs = require('fs');

function Namespace() {
  this.hooks = {};
}

Namespace.prototype.load = function (folder) {
  fs.readdir(folder, function (err, files) {

  });
};

module.exports = Namespace;
