'use strict';

var assert = require('assert');

describe('NamedHooks', function () {
  var NamedHooks;

  describe('require("named-hooks")', function () {

    it('returns a Function', function () {
      NamedHooks = require('..');

      assert.equal(typeof NamedHooks, 'function');
    })
  });
});
