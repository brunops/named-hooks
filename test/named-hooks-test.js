'use strict';

var assert = require('assert'),
    path = require('path'),
    sinon = require('sinon');

var NamedHooks = require('..');

describe('NamedHooks', function () {
  var namedHooks;

  beforeEach(function () {
    namedHooks = new NamedHooks('name');
  });

  describe('require("named-hooks")', function () {
    it('returns a Function', function () {
      assert.equal(typeof NamedHooks, 'function');
    });
  });

  describe('NamedHooks(name)', function () {
    it('named constructor returns an object', function () {
      assert.equal(typeof namedHooks, 'object');
    });

    it('`NamedHooks("myName")` object has `name` attribute set to "myName"', function () {
      namedHooks = NamedHooks('myName');

      assert.equal(namedHooks.name, 'myName');
    });

    it('named constructor returns a `NamedHooks` object', function () {
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
      assert.deepEqual(namedHooks.getPossibleHookNames(), []);
    });

    it('returns [ "hookName" ] if `identifier` is `undefined`', function () {
      assert.deepEqual(namedHooks.getPossibleHookNames('hookName'), [ 'hookName' ]);
    });

    it('returns [ "hookName", "hookNameID" ] if `identifier` is `ID`', function () {
      assert.deepEqual(namedHooks.getPossibleHookNames('hookName', 'ID'), [ 'hookName', 'hookNameID' ]);
    });

    it('returns [ "hookName", "hookNameID", "hookNamefoo", "hookNameIDfoo" ] if `identifier` is `ID-foo`', function () {
      assert.deepEqual(namedHooks.getPossibleHookNames('hookName', 'ID-foo'), [ "hookName", "hookNameID", "hookNamefoo", "hookNameIDfoo" ]);
    });

    it('returns [ "hookName", "hookNameID", "hookNamefoo", "hookNamefoobar", "hookNameIDfoobar" ] if `identifier` is `ID-foo-bar`', function () {
      assert.deepEqual(namedHooks.getPossibleHookNames('hookName', 'ID-foo-bar'), [ "hookName", "hookNameID", "hookNamefoo", "hookNamebar", "hookNameIDfoobar" ]);
    });
  });

  describe('#defineHookResolutionRules(callback)', function () {
    afterEach(function () {
      delete namedHooks.getPossibleHookNames;
    });

    it('sets `getPossibleHookNames` with `callback`', function () {
      var getPossibleHookNames = function () {};

      namedHooks.defineHookResolutionRules(getPossibleHookNames);

      assert.equal(namedHooks.getPossibleHookNames, getPossibleHookNames);
    });

    it('`#getPossibleHookNames` returns [ "hai" ] if `callback` returns [ "hai" ]', function () {
      var getPossibleHookNames = function () {
        return [ 'hai' ];
      };

      namedHooks.defineHookResolutionRules(getPossibleHookNames);

      assert.deepEqual(namedHooks.getPossibleHookNames(), [ 'hai' ]);
    });
  });

  describe('#invoke(hookName, indentifier, data)', function () {
    it('invokes `hook1` hook returned by `#getPossibleHookNames(hookName, identifier)`', function () {
      var spyHook1 = sinon.spy();

      namedHooks.namespace.hooks = {
        hook1: spyHook1
      };

      namedHooks.invoke('hook1', 'id');

      assert.equal(spyHook1.called, true);
    });

    it('invokes `hook1` and `hook1file1` hooks for `#invoke("hook1", "file1")`', function () {
      var spyHook1 = sinon.spy(),
          spyHook1File1 = sinon.spy();

      namedHooks.namespace.hooks = {
        hook1: spyHook1,
        hook1file1: spyHook1File1
      };

      namedHooks.invoke('hook1', 'file1');

      assert.equal(spyHook1.called, true);
      assert.equal(spyHook1File1.called, true);
    });

    it('invokes `hook1` with `data` for `#invoke("hook1", "foo", {})`', function () {
      var data = { count: 0 };

      namedHooks.namespace.hooks = {
        hook1: function (data) {
          data.count += 1;
        }
      };

      namedHooks.invoke('hook1', 'foo', data);

      assert.equal(data.count, 1);
    });

    it('invokes `hook1`, `hook1file1` hooks with same data for `#invoke("hook1", "file1foo", {})`', function () {
      var data = { count: 0 };

      namedHooks.namespace.hooks = {
        hook1: function (data) {
          data.count += 1;
        },

        hook1foo: function (data) {
          data.count += 5;
        }
      };

      namedHooks.invoke('hook1', 'foo', data);

      assert.equal(data.count, 6);
    });


  });
});


