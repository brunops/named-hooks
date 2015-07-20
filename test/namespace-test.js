'use strict';

var assert = require('assert'),
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
    var folder;

    beforeEach(function () {
      folder = '../test/namespace-mock-folder';
    });

    afterEach(function () {
      fs.readdir.restore();
    });

    it('`fs.readdir` is called on `folder`', function () {
      var spy = sinon.spy(fs, 'readdir');

      namespace.load(folder);

      assert.equal(spy.calledWith(folder), true);
    });

    it('`this.hooks` is empty if folder is empty', function () {
      var readdirStub = sinon.stub(fs, 'readdir', curryReaddirStubCb([]));

      namespace.load(folder);

      assert.equal(Object.keys(namespace.hooks).length, 0);
    });

    it('loads `file1.js` exported methods into `this.hooks`', function () {
      var readdirStub = sinon.stub(fs, 'readdir', curryReaddirStubCb([ 'file1.js' ]));

      namespace.load(folder);

      assert.equal(typeof namespace.hooks.myHook, 'function');
    });
  });
});

function curryReaddirStubCb(files) {
  return function (path, callback) {
    callback(null, files);
  }
}


