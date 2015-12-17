'use strict';

var _memoize = require('lodash.memoize'),
    _cloneDeep = require('lodash.clonedeep'),
    q = require('q'),
    debug = require('debug')('named-hooks:named-hooks');

var Namespace = require('./namespace');

var namespaces = {};

function NamedHooks(name) {
  this.name = name;
  debug('created new namespace "%s"', name);
  this.namespace = new Namespace();
}

NamedHooks.prototype.init = function init(folder) {
  debug('#init: loading named-hooks for namespace "%s" from folder "%s"', this.name, folder);
  this.namespace.load(folder);
};

NamedHooks.prototype.defineHookResolutionRules = function defineHookResolutionRules(callback) {
  this.getPossibleHookNames = callback;
  debug('#defineHookResolutionRules: using function with name "%s" to define hook resolution rules', callback.name);
};

NamedHooks.prototype._getPossibleHookNames = function _getPossibleHookNames(hookName, identifier) {
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

// create wrapper function so it's possible to spy on it in tests
NamedHooks.prototype.getPossibleHookNames = function getPossibleHookNames(hookName, identifier) {
  return this._getPossibleHookNames(hookName, identifier);
};

// memoize internal `#_getPossibleHookNames`
// and define lookup key unique key as "`hookName` + '$' + `identifier`" string
NamedHooks.prototype.getPossibleHookNames = _memoize(NamedHooks.prototype.getPossibleHookNames, function (hookName, identifier) {
  return hookName + '$' + identifier;
});

NamedHooks.prototype.invokeSync = function invokeSync(hookName, identifier, data) {
  var possibleHookNames = this.getPossibleHookNames(hookName, identifier),
      result = _cloneDeep(data),
      existingFunctionNames = this._getExistingFunctionNames(possibleHookNames);

  debug('#invokeSync: invoking hooks: %j', existingFunctionNames);
  debug('#invokeSync: invocation of hooks with base hookName "%s" and identifier "%s"', hookName, identifier);

  this._getExistingFunctions(possibleHookNames).forEach(function (fn) {
    result = fn(result);
  }, result);

  return result;
};

NamedHooks.prototype.invoke = function invoke(hookName, identifier, data, context) {
  var possibleHookNames = this.getPossibleHookNames(hookName, identifier),
      existingFunctions = this._getExistingFunctions(possibleHookNames),
      existingFunctionNames = this._getExistingFunctionNames(possibleHookNames),
      result;

  debug('#invoke: invoking hooks: %j', existingFunctionNames);
  debug('#invoke: invocation of hooks with base hookName "%s" and identifier "%s"', hookName, identifier);

  result = _getPromiseChain(existingFunctions, data, context);

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
NamedHooks.prototype.invokeChain = function invokeChain(hookName, identifier, context) {
  var possibleHookNames = this.getPossibleHookNames(hookName, identifier),
      existingFunctionNames = this._getExistingFunctionNames(possibleHookNames),
      existingFunctions = this._getExistingFunctions(possibleHookNames);

  debug('#invokeChain: generate invoke chain for hookName "%s" and identifier "%s"', hookName, identifier);
  debug('#invoke: invoking hooks: %j', existingFunctionNames);

  return function (prevData) {
    debug('#invokeChain: called.');
    return _getPromiseChain(existingFunctions, prevData, context);
  };
};

function _getPromiseChain(existingFunctions, data, context) {
  var data = _cloneDeep(data);

  return _mapHookCalls(existingFunctions, context).reduce(function (prev, curr) {
    return prev.then(curr);
  }, q(data));
}

function _mapHookCalls(hooks, context) {
  context = context || {};

  return hooks.map(function (fn) {
    // async calls
    var async = fn && fn.length > 2;

    if (async) {
      return function (prevData) {
        var defer = q.defer();

        fn(prevData, context, defer.resolve, defer.reject);

        return defer.promise;
      };
    }

    // non-async
    return function (prevData) {
      return fn(prevData, context);
    };
  });
}

NamedHooks.prototype._getExistingFunctions = function _getExistingFunctions(possibleHookNames) {
  return this._getExistingFunctionNames(possibleHookNames).map(function (hookName) {
    return this.namespace.hooks[hookName];
  }, this);
};

NamedHooks.prototype._getExistingFunctionNames = function _getExistingFunctionNames(possibleHookNames) {
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
