'use strict';

var assert = require('assert'),
    fs = require('fs'),
    sinon = require('sinon');

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

  describe('#load(folder)', function () {
    var folder;

    beforeEach(function () {
      folder = './namespace-mock-folder';
    });

    it('`fs.readdir` is called on `folder`', function () {
      var namespace = new Namespace();
      var spy = sinon.spy(fs, 'readdir');

      namespace.load(folder);

      assert.equal(spy.calledWith(folder), true);
    });
  });
});
