'use strict';

var _cloneDeep = require('lodash.clonedeep');

var Namespace = require('./namespace');

var namespaces = {};

function NamedHooks(name) {
  this.name = name;
  this.namespace = new Namespace();
}

NamedHooks.prototype.init = function (folder) {
  this.namespace.load(folder);
};

NamedHooks.prototype.defineHookResolutionRules = function (callback) {
  this.getPossibleHookNames = callback;
};

NamedHooks.prototype.getPossibleHookNames = function (hookName, identifier) {
  if (!hookName) {
    return [];
  }

  var possibleHookNames = [hookName],
      slices = identifier ? identifier.split('-') : [];

  slices.forEach(function (slice) {
    possibleHookNames.push(hookName + slice);
  });

  if (slices.length > 1) {
    possibleHookNames.push(hookName + slices.join(''));
  }

  return possibleHookNames;
};

NamedHooks.prototype.invoke = function (hookName, identifier, data) {
  var possibleHookNames = this.getPossibleHookNames(hookName, identifier),
      result = _cloneDeep(data);

  possibleHookNames.forEach(function (hookName) {
    if (typeof this.namespace.hooks[hookName] === 'function') {
      result = this.namespace.hooks[hookName](result);
    }
  }.bind(this));

  return result;
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


module.exports = createNamedHooks;
