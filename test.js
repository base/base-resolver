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

  it('should decorate a `resolve` method onto the instance', function() {
    assert.equal(typeof base.resolve, 'function');
  });

  it('should emit an `env` object for files that match the given pattern', function(cb) {
    base.once('config', function(key, env) {
      assert(env);
      assert(env.config);
      assert(env.config.path);
      cb();
    });
    base.resolve({pattern: 'basefile.js', cwd: 'fixtures'});
  });

  it('should emit an `env.module` object', function(cb) {
    base.once('config', function(key, env) {
      assert(env);
      assert(env.module);
      assert(env.module.path);
      cb();
    });
    base.resolve({pattern: 'basefile.js', cwd: 'fixtures'});
  });
});
