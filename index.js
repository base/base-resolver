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
    var opts = utils.extend({ module: moduleName }, this.options);

    /**
     * Initialize resolver defaults
     */

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
     *   .resolve('foo', {pattern: 'generator.js', cwd: 'foo'})
     *   .resolve('bar', {pattern: 'generator.js', cwd: 'bar'})
     *   .resolve('baz', {pattern: 'generator.js', cwd: 'baz'})
     * ```
     * @param {String} `name` Optionally specify a namespace for storing resolved configs.
     * @param {Object} `options` Options to pass to [matched][]
     * @param {String|Array} `option.patterns` Glob patterns to search
     * @param {String} `option.cwd` The starting directory to search from
     * @return {Object}
     * @api public
     */

    app.mixin('resolve', function(name, options) {
      if (typeof name !== 'string') {
        return this.resolve('default', name);
      }
      var opts = utils.extend({}, this.options, options);
      this.resolver.resolve(name, opts);
      return this;
    });
  };
};

/**
 * Expose `Resolver`
 */

module.exports.Resolver = utils.Resolver;
