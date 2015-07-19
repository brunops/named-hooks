'use strict';

var assert = require('assert');

var Namespace = require('../lib/namespace');

describe('Namespace', function () {
  describe('constructor', function () {
    it('returns a Function constructor', function () {
      assert.equal(typeof Namespace, 'function');
    });

    it('returns an object with a `hooks` object property', function () {
      var namespace = new Namespace();

      assert.equal(typeof namespace.hooks, 'object');
    });
  });
});


