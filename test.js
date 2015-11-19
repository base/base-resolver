'use strict';

require('mocha');
var path = require('path');
var assert = require('assert');
var register = require('./')
var tasks = require('base-tasks');
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
    base.on('error', function(err) {
      console.log(err);
    })

    base.use(register(App, {
      method: 'app',
      plural: 'apps'
    }));

    function App(name, options, parent, fn) {
      Base.call(this, options, parent, fn);
      this.use(tasks('app'));
      this.path = name;
      this.cwd = path.dirname(name);
      this.name = path.basename(this.cwd, path.extname(this.cwd));
      this.alias = path.basename(this.cwd).split('-').pop();
      try {
        fn.call(this, this, parent);
      } catch (err) {
        console.log(err);
      }
    }

    Base.extend(App);
  });

  describe('glob patterns', function() {
    it('should register locally install modules', function() {
      base.register('fixtures/apps/app-*/*.js');
      assert(base.apps.hasOwnProperty('foo'));
      assert(base.apps.hasOwnProperty('bar'));
      assert(base.apps.hasOwnProperty('baz'));
    });

    it('should register tasks from locally install modules', function() {
      base.register('fixtures/apps/app-*/*.js');

      assert(base.apps.foo.tasks.hasOwnProperty('default'));
      assert(base.apps.foo.tasks.hasOwnProperty('a'));
      assert(base.apps.foo.tasks.hasOwnProperty('b'));
      assert(base.apps.foo.tasks.hasOwnProperty('c'));

      assert(base.apps.bar.tasks.hasOwnProperty('default'));
      assert(base.apps.bar.tasks.hasOwnProperty('a'));
      assert(base.apps.bar.tasks.hasOwnProperty('b'));
      assert(base.apps.bar.tasks.hasOwnProperty('c'));
    });

    it('should fire a "resolve" event for each resolved path', function(cb) {
      base.once('resolve', function (fp) {
        assert(/appfile/.test(fp));
        cb();
      });
      base.register('fixtures/apps/app-*/*.js');
    });
  });
});
