'use strict';

var assert = require('assert');

var Namespace = require('../lib/namespace');

describe('Namespace', function () {
  describe('constructor', function () {

    it('returns a Function constructor', function () {
      assert.equal(typeof Namespace, 'function');
    });
  });
});


