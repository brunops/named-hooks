'use strict';

var assert = require('assert');

var NamedHooks = require('..');

describe('NamedHooks', function () {
  var namespace;

  describe('require("named-hooks")', function () {
    it('returns a Function', function () {
      assert.equal(typeof NamedHooks, 'function');
    });
  });

  describe('require("named-hooks")(namespace)', function () {
    it('namespaced constructor returns an object', function () {
      namespace = require('..')('namespace');

      assert.equal(typeof namespace, 'object');
    });

    it('throws an error if namespace is not a string', function () {

      assert.throws(function () {
        NamedHooks();
      }, Error);
    });

    it('same `namespace` returns the same object', function () {
      var NamedHooks1 = NamedHooks('namespace'),
          NamedHooks2 = NamedHooks('namespace');

      assert.equal(NamedHooks1, NamedHooks2);
    });

    it('different namespaces return different objects', function () {
      var NamedHooks1 = NamedHooks('namespace1'),
          NamedHooks2 = NamedHooks('namespace2');

      assert.notEqual(NamedHooks1, NamedHooks2);
    });
  });
});


