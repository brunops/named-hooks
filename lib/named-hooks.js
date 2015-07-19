'use strict';

var namespaces = {};

function createNamespace(namespace) {
  if (!namespaces[namespace]) {
    namespaces[namespace] = {};
  }

  return namespaces[namespace];
};


module.exports = createNamespace;
