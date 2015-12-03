'use strict';

require('mocha');
var assert = require('assert');
var Base = require('base-methods');
var resolver = require('./');
var base;

describe('errors', function() {
  beforeEach(function() {
    base = new Base();
  });

  it('should throw an error when moduleName is not defined', function(cb) {
    try {
      base.use(resolver());
      cb(new Error('exected an error'));
    } catch (err) {
      assert(err);
      assert.equal(err.message, 'expected "moduleName" to be a string');
      cb();
    }
  });
});

describe('resolver', function() {
  beforeEach(function() {
    base = new Base();
    base.use(resolver('base-methods'));
  });

  it('should decorate `resolver` onto the instance', function() {
    assert.equal(typeof base.resolver, 'object');
  });

  it('should expose a static `getConfig` method', function() {
    assert.equal(typeof resolver.getConfig, 'function');
  });

  it('should decorate a `resolve` method onto the instance', function() {
    assert.equal(typeof base.resolve, 'function');
  });

  it('should emit a config for files that match the given pattern', function(cb) {
    base.once('config', function(config) {
      assert(config);
      assert(config.path);
      cb();
    });
    base.resolve('basefile.js', {cwd: 'fixtures'});
  });

  it('should emit `module` as the second arg', function(cb) {
    base.once('config', function(config, mod) {
      assert(mod);
      assert(mod.path);
      cb();
    });
    base.resolve('basefile.js', {cwd: 'fixtures'});
  });
});
