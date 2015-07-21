'use strict';

var Namespace = require('./namespace');

var namespaces = {};

function NamedHooks(name) {
  this.name = name;
  this.namespace = new Namespace();
}

NamedHooks.prototype.init = function (folder) {
  this.namespace.load(folder);
};

function createNamedHooks(name) {
  if (typeof name !== 'string') {
    throw new Error('`name` must be a string');
  }

  if (!namespaces[name]) {
    namespaces[name] = new NamedHooks(name);
  }

  return namespaces[name];
};


module.exports = createNamespace;
