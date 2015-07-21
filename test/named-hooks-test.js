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

  describe('NamedHooks(name)', function () {
    it('named constructor returns an object', function () {
      namespace = NamedHooks('name');

      assert.equal(typeof namespace, 'object');
    });

    it('namespaced constructor returns a `Namespace` object', function () {
      namespace = NamedHooks('namespace');

      assert.equal(namespace.constructor.name, 'Namespace');
    });

    it('throws an error if `name` is not a string', function () {
      assert.throws(function () {
        NamedHooks();
      }, Error);
    });

    it('same `name` returns the same object', function () {
      var NamedHooks1 = NamedHooks('name'),
          NamedHooks2 = NamedHooks('name');

      assert.equal(NamedHooks1, NamedHooks2);
    });

    it('different `name`s return different objects', function () {
      var NamedHooks1 = NamedHooks('name1'),
          NamedHooks2 = NamedHooks('name2');

      assert.notEqual(NamedHooks1, NamedHooks2);
    });
  });
});


