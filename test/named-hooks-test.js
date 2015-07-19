'use strict';

var assert = require('assert');

describe('NamedHooks', function () {
  var NamedHooks;

  describe('require("named-hooks")', function () {

    it('returns a Function', function () {
      NamedHooks = require('..');

      assert.equal(typeof NamedHooks, 'function');
    });
  });

  describe('require("named-hooks")(namespace)', function () {
    it('namespaced constructor returns an object', function () {
      NamedHooks = require('..')('namespace');

      assert.equal(typeof NamedHooks, 'object');
    });

    it('same `namespace` returns the same object', function () {
      var NamedHooks1 = require('..')('namespace'),
          NamedHooks2 = require('..')('namespace');

      assert.equal(NamedHooks1, NamedHooks2);
    });

    it('different namespaces return different objects', function () {
      var NamedHooks1 = require('..')('namespace1'),
          NamedHooks2 = require('..')('namespace2');

      assert.notEqual(NamedHooks1, NamedHooks2);
    });
  });
});


