'use strict';

var assert = require('assert'),
    path = require('path'),
    sinon = require('sinon');

var NamedHooks = require('..');

describe('NamedHooks', function () {
  var namedHooks;

  describe('require("named-hooks")', function () {
    it('returns a Function', function () {
      assert.equal(typeof NamedHooks, 'function');
    });
  });

  describe('NamedHooks(name)', function () {
    it('named constructor returns an object', function () {
      namedHooks = NamedHooks('name');

      assert.equal(typeof namedHooks, 'object');
    });

    it('`NamedHooks("myName")` object has `name` attribute set to "myName"', function () {
      namedHooks = NamedHooks('myName');

      assert.equal(namedHooks.name, 'myName');
    });

    it('named constructor returns a `NamedHooks` object', function () {
      namedHooks = NamedHooks('name');

      assert.equal(namedHooks.constructor.name, 'NamedHooks');
    });

    it('throws an error if `name` is not a string', function () {
      assert.throws(function () {
        NamedHooks();
      }, Error);
    });

    it('same `name` returns the same object', function () {
      var namedHooks1 = NamedHooks('name'),
          namedHooks2 = NamedHooks('name');

      assert.equal(namedHooks1, namedHooks2);
    });

    it('different `name`s return different objects', function () {
      var namedHooks1 = NamedHooks('name1'),
          namedHooks2 = NamedHooks('name2');

      assert.notEqual(namedHooks1, namedHooks2);
    });
  });

  describe('#init(folder)', function () {
    it('loads all hooks from all files of `folder` into `name` namespace', function () {
      var namedHooks1 = NamedHooks('name'),
          spy = sinon.spy(namedHooks1.namespace, 'load');

      namedHooks1.init(path.resolve('./test/namespace-mock-folder'));

      assert.equal(spy.called, true);
    });
  });

  describe('#getPossibleHookNames(hookName, identifier)', function () {
    it('returns empty Array if `hookName` is `undefined`', function () {
      var namedHooks = NamedHooks('name');

      assert.deepEqual(namedHooks.getPossibleHookNames(), []);
    });

    it('returns [ "hookName" ] if `identifier` is `undefined`', function () {
      var namedHooks = NamedHooks('name');

      assert.deepEqual(namedHooks.getPossibleHookNames('hookName'), [ 'hookName' ]);
    });

    it('returns [ "hookName", "hookNameID" ] if `identifier` is `ID`', function () {
      var namedHooks = NamedHooks('name');

      assert.deepEqual(namedHooks.getPossibleHookNames('hookName', 'ID'), [ 'hookName', 'hookNameID' ]);
    });

    it('returns [ "hookName", "hookNameID", "hookNamefoo", "hookNameIDfoo" ] if `identifier` is `ID-foo`', function () {
      var namedHooks = NamedHooks('name');

      assert.deepEqual(namedHooks.getPossibleHookNames('hookName', 'ID-foo'), [ "hookName", "hookNameID", "hookNamefoo", "hookNameIDfoo" ]);
    });

    it('returns [ "hookName", "hookNameID", "hookNamefoo", "hookNamefoobar", "hookNameIDfoobar" ] if `identifier` is `ID-foo-bar`', function () {
      var namedHooks = NamedHooks('name');

      assert.deepEqual(namedHooks.getPossibleHookNames('hookName', 'ID-foo-bar'), [ "hookName", "hookNameID", "hookNamefoo", "hookNamebar", "hookNameIDfoobar" ]);
    });    
  });

  describe('#defineHookResolutionRules(callback)', function () {
    it('sets `getPossibleHookNames` with `callback`', function () {
      var namedHooks = NamedHooks('name'),
          getPossibleHookNames = function () {};

      namedHooks.defineHookResolutionRules(getPossibleHookNames);

      assert.equal(namedHooks.getPossibleHookNames, getPossibleHookNames);
    });

    it('`#getPossibleHookNames` returns [ "hai" ] if `callback` returns [ "hai" ]', function () {
      var namedHooks = NamedHooks('name'),
          getPossibleHookNames = function () {
            return [ 'hai' ];
          };

      namedHooks.defineHookResolutionRules(getPossibleHookNames);

      assert.deepEqual(namedHooks.getPossibleHookNames(), [ 'hai' ]);
    });
  });
});


