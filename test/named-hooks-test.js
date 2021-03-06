'use strict';

var assert = require('assert'),
    path = require('path'),
    sinon = require('sinon'),
    q = require('q');

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
    var spy;

    beforeEach(function () {
      spy = sinon.spy(namedHooks, '_getPossibleHookNames');
    });

    afterEach(function () {
      spy.restore();
    });

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

    it('memoizes the result', function () {
      namedHooks.getPossibleHookNames('hookName2', 'ID-foo-bar');
      namedHooks.getPossibleHookNames('hookName2', 'ID-foo-bar');

      sinon.assert.calledOnce(spy);
    });

    it('memoization key is `hookName` + `identifier`', function () {
      namedHooks.getPossibleHookNames('hookName3', 'ID'),
      namedHooks.getPossibleHookNames('hookName3', 'ID-foo');

      sinon.assert.calledTwice(spy);
    });

    it('memoized result is exactly the same', function () {
      var result1 = namedHooks.getPossibleHookNames('hookName4', 'ID-foo-bar'),
          result2 = namedHooks.getPossibleHookNames('hookName4', 'ID-foo-bar');

      assert.deepEqual(result1, result2);
    });

    it('memoization is invalidated when `#init` is called', function () {
      namedHooks.getPossibleHookNames('hookName5', 'ID-foo-bar');

      namedHooks.init(path.resolve('./test/namespace-mock-folder'));

      namedHooks.getPossibleHookNames('hookName5', 'ID-foo-bar');

      sinon.assert.calledTwice(spy);
    });
  });

  describe('#defineHookResolutionRules(callback)', function () {
    afterEach(function () {
      delete namedHooks.getPossibleHookNames;
    });

    it('throws if `callback` is not a function', function () {
      assert.throws(function () {
        namedHooks.defineHookResolutionRules(123);
      });
    });

    it('`#getPossibleHookNames` returns [ "hai" ] if `callback` returns [ "hai" ]', function () {
      var getPossibleHookNames = function () {
        return [ 'hai' ];
      };

      namedHooks.defineHookResolutionRules(getPossibleHookNames);

      assert.deepEqual(namedHooks.getPossibleHookNames(), [ 'hai' ]);
    });

    it('memoization keeps working', function () {
      var spy = sinon.spy();

      namedHooks.defineHookResolutionRules(spy);

      namedHooks.getPossibleHookNames('hookName4', 'ID-foo-bar');
      namedHooks.getPossibleHookNames('hookName4', 'ID-foo-bar');

      sinon.assert.calledOnce(spy);
    });

    it('invalidates memoization cache', function () {
      var spy = sinon.spy();

      namedHooks.defineHookResolutionRules(spy);
      namedHooks.getPossibleHookNames('hookName5', 'ID-foo-bar');

      namedHooks.defineHookResolutionRules(spy);
      namedHooks.getPossibleHookNames('hookName5', 'ID-foo-bar');

      sinon.assert.calledTwice(spy);
    });
  });

  describe('#invokeSync(hookName, indentifier, data)', function () {
    it('invokes `hook1` hook returned by `#getPossibleHookNames(hookName, identifier)`', function () {
      var spyHook1 = sinon.spy();

      namedHooks.namespace.hooks = {
        hook1: spyHook1
      };

      namedHooks.invokeSync('hook1', 'id');

      assert.equal(spyHook1.called, true);
    });

    it('invokes `hook1` and `hook1file1` hooks for `#invokeSync("hook1", "file1")`', function () {
      var spyHook1 = sinon.spy(),
          spyHook1File1 = sinon.spy();

      namedHooks.namespace.hooks = {
        hook1: spyHook1,
        hook1file1: spyHook1File1
      };

      namedHooks.invokeSync('hook1', 'file1');

      assert.equal(spyHook1.called, true);
      assert.equal(spyHook1File1.called, true);
    });

    it('hooks do not modify original `data` object', function () {
      var data = {
        count: 0
      };

      namedHooks.namespace.hooks = {
        hook1: function (data) {
          data.count += 1;
        }
      };

      namedHooks.invokeSync('hook1', 'foo', data);

      assert.equal(data.count, 0);
    });

    it('hooks do not modify original `data` object or nested objects (deepClone)', function () {
      var obj = {
          hey: 5
        },

        data = {
          count: 0,
          nested: obj
        };

      namedHooks.namespace.hooks = {
        hook1: function (data) {
          data.nested.hey += 1;

          return data;
        }
      };

      var result = namedHooks.invokeSync('hook1', 'foo', data);

      assert.equal(data.nested.hey, 5);
      assert.equal(obj.hey, 5);
      assert.equal(result.nested.hey, 6);
    });

    it('invokes `hook1` with `data` for `#invokeSync("hook1", "foo", {})`', function () {
      var data = { count: 0 };

      namedHooks.namespace.hooks = {
        hook1: function (data) {
          data.count += 1;

          return data;
        }
      };

      var result = namedHooks.invokeSync('hook1', 'foo', data);

      assert.equal(result.count, 1);
    });

    it('invokes `hook1`, `hook1file1foo` hooks with same data for `#invokeSync("hook1", "file1-foo", {})`', function () {
      var data = { count: 0 };

      namedHooks.namespace.hooks = {
        hook1: function (data) {
          data.count += 1;

          return data;
        },

        hook1file1foo: function (data) {
          data.count += 5;

          return data;
        }
      };

      var result = namedHooks.invokeSync('hook1', 'file1-foo', data);

      assert.equal(result.count, 6);
    });
  });

  describe('#invoke(hookName, indentifier, data, context)', function () {
    it('returns a promise', function () {
      var invokeReturn = namedHooks.invoke('hookName', 'foo', 3);

      assert.equal(typeof invokeReturn.then, 'function');
    });

    it('hooks defined with one argument can transform `data` and return it', function (done) {
      var data = 1;

      namedHooks.namespace.hooks = {
        sync: function (data) {
          return data + 2;
        }
      };

      namedHooks.invoke('sync', 'foo', data)
        .then(function (result) {
          assert.equal(result, 3);
        })
        .done(done);
    });

    it('does not modify original `data` object or nested objects (deepClone)', function (done) {
      var obj = {
          hey: 5
        },

        data = {
          count: 0,
          nested: obj
        };

      namedHooks.namespace.hooks = {
        hook1: function (data) {
          data.nested.hey += 1;

          return data;
        }
      };

      namedHooks.invoke('hook1', 'foo', data)
        .then(function (result) {
          assert.equal(data.nested.hey, 5);
          assert.equal(obj.hey, 5);
          assert.equal(result.nested.hey, 6);
        })
        .done(done)
    });

    it('hooks defined with two arguments take a `context` object with a closure from the invoking function', function (done) {
      var context = {
            foo: 'bar'
          },
          data = 5;

      namedHooks.namespace.hooks = {
        async: function (data, context, resolve) {
          resolve(context);
        }
      };

      namedHooks.invoke('async', 'file1', data, context)
        .then(function (result) {
          assert.strictEqual(result, context);
        })
        .done(done);
    });

    it('an empty object is passed as `context` if none is provided', function (done) {
      var data = 5;

      namedHooks.namespace.hooks = {
        async: function (data, context, resolve) {
          resolve(context);
        }
      };

      namedHooks.invoke('async', 'file1', data)
        .then(function (result) {
          assert.deepEqual(result, {});
        })
        .done(done);
    });

    it('hooks defined with three arguments take a `resolve` callback to fulfill a promise', function (done) {
      var data = 5;

      namedHooks.namespace.hooks = {
        async: function (data, context, resolve) {
          resolve(0);
        }
      };

      namedHooks.invoke('async', 'file1', data)
        .then(function (result) {
          assert.equal(result, 0);
        })
        .done(done);
    });

    it('hooks defined with four arguments take a `reject` callback to fulfill a promise', function (done) {
      var data = 5;

      namedHooks.namespace.hooks = {
        async: function (data, context, resolve, reject) {
          reject(0);
        }
      };

      namedHooks.invoke('async', 'file1', data)
        .catch(function (err) {
          assert.equal(err, 0);
        })
        .done(done);
    });

    it('sync and async hooks can be mixed', function (done) {
      var data = 2;

      namedHooks.namespace.hooks = {
        // async hook
        hook1: function (data, context, resolve) {
          // make sure it executes on next loop
          setImmediate(resolve, 0);
        },

        // sync hook
        hook1file1: function (data) {
          return data + 1;
        }
      };

      namedHooks.invoke('hook1', 'file1', data)
        .then(function (result) {
          assert.equal(result, 1);
        })
        .done(done);
    });

    it('sync and async hooks can be mixed, like, a lot', function (done) {
      var data = 2;

      namedHooks.namespace.hooks = {
        // sync hook
        hook1: function (data) {
          return data + 1;
        },

        // async hook
        hook1file1: function (data, context, resolve) {
          setImmediate(resolve, 0);
        },

        // sync hook 2
        hook1foo: function (data) {
          return data + 6;
        },

        // async hook 3
        hook1bar: function (data, context, resolve) {
          setImmediate(resolve, data + 1);
        },
      };

      namedHooks.invoke('hook1', 'file1-foo-bar', data)
        .then(function (result) {
          assert.equal(result, 7);
        })
        .done(done);
    });

    it('invokes `hook1` when `hookName` is "hook1"', function (done) {
      var spyHook1 = sinon.spy();

      namedHooks.namespace.hooks = {
        hook1: spyHook1
      };

      namedHooks.invoke('hook1', 'id', {})
        .then(function () {
          assert.equal(spyHook1.called, true);
        })
        .done(done);
    });

    it('invokes `hook1` and `hook1file1` hooks for `#invoke("hook1", "file1")`', function (done) {
      var spyHook1 = sinon.spy(),
          spyHook1File1 = sinon.spy();

      namedHooks.namespace.hooks = {
        hook1: spyHook1,
        hook1file1: spyHook1File1
      };

      namedHooks.invoke('hook1', 'file1', '')
        .then(function () {
          assert.equal(spyHook1.called, true);
          assert.equal(spyHook1File1.called, true);
        })
        .done(done);
    });

    it('hooks do not modify original `data` object', function (done) {
      var data = {
        count: 0
      };

      namedHooks.namespace.hooks = {
        hook1: function (data) {
          data.count += 1;
        }
      };

      namedHooks.invoke('hook1', 'foo', data)
        .then(function (result) {
          assert.equal(data.count, 0);
        })
        .done(done);
    });

    it('hooks do not modify original `data` object or nested objects (deepClone)', function (done) {
      var obj = {
          hey: 5
        },

        data = {
          count: 0,
          nested: obj
        };

      namedHooks.namespace.hooks = {
        hook1: function (data) {
          data.nested.hey += 1;

          return data;
        }
      };

      namedHooks.invoke('hook1', 'foo', data)
        .then(function (result) {
          assert.equal(data.nested.hey, 5);
          assert.equal(obj.hey, 5);
          assert.equal(result.nested.hey, 6);
        })
        .done(done);
    });

    it('invokes `hook1` with `data` for `#invoke("hook1", "foo", {})`', function (done) {
      var data = { count: 0 };

      namedHooks.namespace.hooks = {
        hook1: function (data) {
          data.count += 1;

          return data;
        }
      };

      namedHooks.invoke('hook1', 'foo', data)
        .then(function (result) {
          assert.equal(result.count, 1);
        })
        .done(done);
    });

    it('invokes `hook1`, `hook1file1foo` hooks with same data for `#invoke("hook1", "file1-foo", {})`', function (done) {
      var data = { count: 0 };

      namedHooks.namespace.hooks = {
        hook1: function (data) {
          data.count += 1;

          return data;
        },

        hook1file1foo: function (data) {
          data.count += 5;

          return data;
        }
      };

      namedHooks.invoke('hook1', 'file1-foo', data)
        .then(function (result) {
          assert.equal(result.count, 6);
        })
        .done(done);
    });
  });

  describe('#invokeChain(hookName, identifier, context)', function () {
    it('returns a function', function () {
      var returnedValue = namedHooks.invokeChain('hook1', 'id');

      assert.equal(typeof returnedValue, 'function');
    });

    it('can be used inside a promise chain', function (done) {
      namedHooks.namespace.hooks = {
        hook1: function (data, context, resolve) {
          setImmediate(resolve, data + 60);
        },

        hook1file1: function (data) {
          return data + 6;
        }
      };

      q(600)
        .then(namedHooks.invokeChain('hook1', 'file1'))
        .then(function (result) {
          assert.equal(result, 666);
        })
        .done(done);
    });

    it('does not modify original `data` object or nested objects (deepClone)', function (done) {
      var obj = {
          hey: 5
        },

        data = {
          count: 0,
          nested: obj
        };

      namedHooks.namespace.hooks = {
        hook1: function (data) {
          data.nested.hey += 1;

          return data;
        }
      };

      q(data)
        .then(namedHooks.invokeChain('hook1', ''))
        .then(function (result) {
          assert.equal(data.nested.hey, 5);
          assert.equal(obj.hey, 5);
          assert.equal(result.nested.hey, 6);
        })
        .done(done)
    });

    it('takes a `context` object as third parameter and makes it available as the first argument of all hooks', function (done) {
      namedHooks.namespace.hooks = {
        hook1: function (data, context) {
          return data + 1;
        }
      };

      var context = {
            foo: 'bar',
            baz: 'qux'
          },
          spy = sinon.spy(namedHooks.namespace.hooks, 'hook1'),
          invokeChain = namedHooks.invokeChain('hook1', 'id', context);

      q(5)
        .then(invokeChain)
        .then(function (result) {
          sinon.assert.calledWith(spy, 5, context);
        })
        .done(done);
    });

    it('same `context` is accessible to all hooks, sync or async', function (done) {
      var context = { foo: 'bar' };

      namedHooks.namespace.hooks = {
        hook1: function (data, context) {
          return data + 1;
        },

        hook1file1: function (data, context, resolve) {
          setImmediate(resolve, context);
        }
      };

      q(3)
        .then(namedHooks.invokeChain('hook1', 'file1', context))
        .then(function (result) {
          assert.strictEqual(result, context);
        })
        .done(done);
    });
  });
});

