/*!
 * base-resolver <https://github.com/jonschlinkert/base-resolver>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var utils = require('./utils');

module.exports = function(moduleName) {
  if (typeof moduleName !== 'string') {
    throw new TypeError('expected "moduleName" to be a string');
  }

  return function(app) {
    var Resolver = utils.Resolver;

    /**
     * Initialize resolver defaults
     */

    var opts = utils.extend({ module: moduleName }, this.options);
    this.define('resolver', new Resolver(opts));

    /**
     * Forward `config` events from `resovler`
     */

    this.resolver.on('config', this.emit.bind(this, 'config'));

    /**
     * Passes the given glob pattern(s) to [matched][] and emits a
     * `config` object for each matching file.
     *
     * ```js
     * resolver.on('config', function(config) {
     *   // do stuff with "config"
     * });
     *
     * resolver
     *   .resolve('generator.js', {cwd: 'foo'})
     *   .resolve('generator.js', {cwd: 'bar'})
     *   .resolve('generator.js', {cwd: 'baz'})
     * ```
     * @param {String|Array} `patterns` Glob patterns to search
     * @param {Object} `options` Options to pass to [matched][]
     * @return {Object}
     * @api public
     */

    app.mixin('resolve', function(patterns, options) {
      var opts = utils.extend({}, this.options, options);
      this.resolver.resolve(patterns, opts);
      return this;
    });
  };
};

/**
 * If necessary, this static method will resolve the _first instance_
 * to be used as the `base` instance for caching any additional resolved configs.
 *
 * ```js
 * var Generate = require('generate');
 * var resolver = require('base-resolver');
 *
 * var generate = resolver.first('generator.js', 'generate', {
 *   Ctor: Generate,
 *   isModule: function(app) {
 *     return app.isGenerate;
 *   }
 * });
 * ```
 * @param {String} `configfile` The name of the config file, ex: `assemblefile.js`
 * @param {String} `moduleName` The name of the module to lookup, ex: `assemble`
 * @param {Object} `options`
 *   @option {Function} `options.isModule` Optionally pass a function that will be used to verify that the correct instance was created.
 * @return {Object}
 * @api public
 */

module.exports.getConfig = function(configfile, moduleName, options) {
  var opts = utils.extend({cwd: process.cwd()}, options);
  var fp = path.resolve(opts.cwd, configfile);
  var Resolver = utils.Resolver;
  var Ctor = opts.Ctor;

  if (typeof Ctor !== 'function') {
    throw new TypeError('expected options.Ctor to be a function');
  }

  var validate = function() {
    return false;
  };

  if (typeof opts.isModule === 'function') {
    validate = opts.isModule;
  }

  // if a "configfile.js" is in the user's cwd, we'll try to
  // require it in and use it to get (or create) the instance
  if (fs.existsSync(fp)) {
    var env = new Resolver.Config({path: fp});
    var mod = new Resolver.Mod(moduleName, env);
    env.module = mod;

    Ctor = mod.fn;

    // `fn` is whatever the "configfile" returns
    var fn = env.fn;

    // if the "configfile" returns a function, we need to
    // call the function, and pass an instance of our
    // application to it
    if (typeof fn === 'function') {
      var app = new Ctor();
      app.fn = fn;
      app.env = env;

      fn.call(app, app, app.base, env);

      // set the `app` function on the instance, so it
      // can be used to utils.extend other generators if needed
      return app;
    } else if (validate(fn)) {
      // if the "configfile" returns an instance of our application
      // we'll use that as our `base`
      return fn;
    }
  }
  return new Ctor();
};
