'use strict';

require('mocha');
var assert = require('assert');
var register = require('./')
var Base = require('base-methods');
var base;

describe('create', function() {
  beforeEach(function() {
    base = new Base();
  })

  it('should add a register method to the instance', function() {
    base.use(register());
    assert.equal(typeof base.register, 'function');
  });

  it('should add a resolve method to the instance', function() {
    base.use(register());
    assert.equal(typeof base.resolve, 'function');
  });

  it('should add custom method "method" to the instance', function() {
    base.use(register({
      method: 'foo'
    }));
    assert.equal(typeof base.foo, 'function');
  });

  it('should use Ctor name to create custom "get" method', function() {
    function Assemble() {}
    base.use(register(Assemble));
    assert.equal(typeof base.getAssemble, 'function');
  });
});

describe('resolve', function() {
  beforeEach(function() {
    base = new Base();
    function App(name, options, parent, fn) {
      Base.call(this, options, parent, fn);
    }
    Base.extend(App);

    base.use(register(App, {
      method: 'app',
      plural: 'apps'
    }));
  });

  describe('glob patterns', function() {
    it('should resolve locally install modules', function() {
      base.resolve('*.js');
      console.log(base)
      // assert(runner instanceof Runner);
    });
  });


  // describe('initialization', function() {
  //   it('should listen for errors:', function(cb) {
  //     runner = new Runner();
  //     runner.on('error', function(err) {
  //       assert(err.message === 'foo');
  //       cb();
  //     });
  //     runner.emit('error', new Error('foo'));
  //   });
  // });
});
