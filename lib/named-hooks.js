'use strict';

var _cloneDeep = require('lodash.clonedeep'),
    q = require('q');

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

NamedHooks.prototype.invokeSync = function (hookName, identifier, data) {
  var possibleHookNames = this.getPossibleHookNames(hookName, identifier),
      result = _cloneDeep(data);

  this._getExistingFunctions(possibleHookNames).forEach(function (fn) {
    result = fn(result);
  }, result);

  return result;
};

NamedHooks.prototype.invoke = function (hookName, identifier, data) {
  var possibleHookNames = this.getPossibleHookNames(hookName, identifier),
      existingFunctions = this._getExistingFunctions(possibleHookNames),
      data = _cloneDeep(data);

  return _mapDefferedAsyncs(existingFunctions).reduce(function (prev, curr) {
    return prev.then(curr);
  }, q(data));
};

function _mapDefferedAsyncs(hooks) {
  return hooks.map(function (fn) {
    var async = fn && fn.length === 2;

    if (async) {
      return function (prevData) {
        var defer = q.defer();

        fn(prevData, defer.resolve);

        return defer.promise;
      };
    }

    return fn;
  });
};

NamedHooks.prototype._getExistingFunctions = function (possibleHookNames) {
  var existingFunctions = [];

  possibleHookNames.forEach(function (hookName) {
    if (typeof this.namespace.hooks[hookName] === 'function') {
      existingFunctions.push(this.namespace.hooks[hookName]);
    }
  }.bind(this));

  return existingFunctions;
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
