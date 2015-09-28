'use strict';

var _cloneDeep = require('lodash.clonedeep'),
    q = require('q'),
    debug = require('debug')('named-hooks:named-hooks');

var Namespace = require('./namespace');

var namespaces = {};

function NamedHooks(name) {
  this.name = name;
  debug('created new namespace "%s"', name);
  this.namespace = new Namespace();
}

NamedHooks.prototype.init = function (folder) {
  debug('#init: loading named-hooks for namespace "%s" from folder "%s"', this.name, folder);
  this.namespace.load(folder);
};

NamedHooks.prototype.defineHookResolutionRules = function (callback) {
  this.getPossibleHookNames = callback;
  debug('#defineHookResolutionRules: using function with name "%s" to define hook resolution rules', callback.name);
};

NamedHooks.prototype.getPossibleHookNames = function (hookName, identifier) {
  if (!hookName) {
    debug('#getPossibleHookNames: no base hookName given. Returning empty array');
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

  debug('#getPossibleHookNames: possible hook names for base hookName "%s" with identifier "%s" are: %j', hookName, identifier, possibleHookNames);
  return possibleHookNames;
};

NamedHooks.prototype.invokeSync = function (hookName, identifier, data) {
  var possibleHookNames = this.getPossibleHookNames(hookName, identifier),
      result = _cloneDeep(data),
      existingFunctionNames = this._getExistingFunctionNames(possibleHookNames);

  debug('#invokeSync: invoking hooks with names: %j', existingFunctionNames);

  this._getExistingFunctions(possibleHookNames).forEach(function (fn) {
    result = fn(result);
  }, result);

  debug('#invokeSync: invocation of hooks with base hookName "%s" and identifier "%s"', hookName, identifier);
  return result;
};

NamedHooks.prototype.invoke = function (hookName, identifier, data) {
  var possibleHookNames = this.getPossibleHookNames(hookName, identifier),
      existingFunctions = this._getExistingFunctions(possibleHookNames),
      existingFunctionNames = this._getExistingFunctionNames(possibleHookNames),
      data = _cloneDeep(data),
      result;

  debug('#invoke: invoking hooks with names: %j', existingFunctionNames);

  result = _getPromiseChain(existingFunctions, data);
  debug('#invoke: invocation of hooks with base hookName "%s" and identifier "%s"', hookName, identifier);
  return result;
};

// Returns a function to be used in a promise chain without
// crazy bindings
// i.e.:
//    q(5)
//      .then(namedHooks.invokeChain('hookName', 'indentifier'))
//      .then(console.log);
//
// as opposed to:
// i.e. (crazy binding):
//    q(5)
//      .then(namedHooks.invoke.bind(namedHooks, 'hookName', 'indentifier'))
//      .then(console.log);
NamedHooks.prototype.invokeChain = function (hookName, identifier) {
  var possibleHookNames = this.getPossibleHookNames(hookName, identifier),
      existingFunctions = this._getExistingFunctions(possibleHookNames);

  return function (prevData) {
    debug('#invokeChain: called.');
    return _getPromiseChain(existingFunctions, prevData);
  };
};

function _getPromiseChain(existingFunctions, data) {
  return _mapDefferedAsyncs(existingFunctions).reduce(function (prev, curr) {
    return prev.then(curr);
  }, q(data));
}

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
}

NamedHooks.prototype._getExistingFunctions = function (possibleHookNames) {

  return this._getExistingFunctionNames(possibleHookNames).map(function (hookName) {
    return this.namespace.hooks[hookName];
  }, this);
};

NamedHooks.prototype._getExistingFunctionNames = function (possibleHookNames) {
  var existingFunctionNames = [];

  possibleHookNames.forEach(function (hookName) {
    if (typeof this.namespace.hooks[hookName] === 'function') {
      existingFunctionNames.push(hookName);
    }
  }.bind(this));

  return existingFunctionNames;
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
