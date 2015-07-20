'use strict';

var Namespace = require('./namespace');

var namespaces = {};

function createNamespace(namespace) {
  if (typeof namespace !== 'string') {
    throw new Error('`namespace` must be a string');
  }

  if (!namespaces[namespace]) {
    namespaces[namespace] = new Namespace();
  }

  return namespaces[namespace];
};


module.exports = createNamespace;
