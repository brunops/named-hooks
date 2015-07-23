'use strict';

var assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    sinon = require('sinon');

var Namespace = require('../lib/namespace');

describe('Namespace', function () {
  var namespace;

  beforeEach(function () {
    namespace = new Namespace();
  });

  describe('constructor', function () {
    it('returns a Function constructor', function () {
      assert.equal(typeof Namespace, 'function');
    });

    it('returns an object with a `hooks` object property', function () {
      assert.equal(typeof namespace.hooks, 'object');
    });
  });

  describe('#load(folder)', function () {
    var folder,
        readdirSyncStub;

    beforeEach(function () {
      folder = path.resolve('./test/namespace-mock-folder');

      readdirSyncStub = sinon.stub(fs, 'readdirSync');
    });

    afterEach(function () {
      fs.readdirSync.restore();
    });

    it('`fs.readdirSync` is called on `folder`', function () {
      fs.readdirSync.restore();
      var spy = sinon.spy(fs, 'readdirSync');

      namespace.load(folder);

      assert.equal(spy.calledWith(folder), true);
    });

    it('throws an error if `folder` does not exist', function () {
      assert.throws(function () {
        namespace.load('./does-not-exist');
      }, Error);
    });

    it('`this.hooks` is empty if folder is empty', function () {
      readdirSyncStub.returns([]);

      namespace.load(folder);

      assert.equal(Object.keys(namespace.hooks).length, 0);
    });

    it('loads `file1.js` exported methods into `this.hooks`', function () {
      readdirSyncStub.returns([ 'file1.js' ]);

      namespace.load(folder);

      assert.equal(typeof namespace.hooks.hook1file1, 'function');
    });

    it('loads `file1.js` and `file2.js` exported methods into `this.hooks`', function () {
      readdirSyncStub.returns([ 'file1.js', 'file2.js' ]);

      namespace.load(folder);

      assert.equal(Object.keys(namespace.hooks).length, 4);
    });
  });
});


