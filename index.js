/*!
 * base-resolver <https://github.com/jonschlinkert/base-resolver>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var utils = require('./utils');

module.exports = function(App, config) {
  if (typeof App !== 'function') {
    config = App;
    App = null;
  }

  config = utils.createConfig(config);

  return function(app) {
    var opts = utils.extend({}, this.options, config);
    var method = opts.method || 'app';
    var plural = opts.plural || 'apps';
    var appname = App ? App.name : 'App';
    var get = 'get' + appname;

    if (!this[plural]) {
      this[plural] = {};
    }

    function error(msg, name) {
      throw new Error(appname + ' ' + msg + ' ' + method + ': "' + name + '"');
    }

    /**
     * Listen for `resolve` then register filepaths as they're emitted.
     */

    this.on('resolve', function(fp, options) {
      app.register(fp, options, utils.tryRequire(fp));
    });

    /**
     * Aliased-proxy to the `register` method for getting or setting
     * an `app` on the instance (for example, generators and
     * updaters are apps).
     *
     * @param {String} `name`
     * @param {Object} `options`
     * @param {Function} `fn`
     * @return {Object} Returns an app.
     */

    app.define(method, function(name, options, fn) {
      if (arguments.length === 1 && typeof name === 'string') {
        return this[get].apply(this, arguments);
      }
      return this.register.apply(this, arguments);
    });


    app.define(get, function(name) {
      if (name === 'base') return this;
      name = name.split('.').join('.' + plural + '.');

      var res = utils.get(this[plural], name);
      if (typeof res === 'undefined') {
        error('cannot resolve', name);
      }
      return res;
    });

    /**
     * Get or set an `app` (generator, updater, etc.) on the instance.
     *
     * ```js
     * generate.register('generate-foo', opts, function(app, base, env) {
     *   // do stuff
     * });
     * ```
     * @param {String} `name`
     * @param {Object} `options`
     * @param {Function} `fn`
     * @return {Object} Returns an app.
     * @api public
     */

    app.define('register', register);

    function register(path, options, fn) {
      if (typeof options === 'function') {
        return this.register(path, {}, options);
      }

      if (utils.hasGlob(path)) {
        return this.resolve.apply(this, arguments);
      }

      try {
        var inst = new App(path, options, this, fn);
        var tasks = inst.tasks || [];
        var alias = inst.alias;

        if (this.run && typeof inst.use === 'function') {
          this.run(inst);
        }

        this.emit('register', alias, inst);
        this[plural][alias] = inst;
        return inst;
      } catch (err) {
        err.method = 'register';
        err.args = [].slice.call(arguments);
        app.emit('error', err);
      }
    }

    /**
     * Resolve the paths to local and/or global npm modules that
     * match the given glob patterns.
     *
     * @param {String} `name`
     * @param {Object} `options`
     * @param {Function} `fn`
     * @return {Object} Returns an app.
     */

    app.define('resolve', function(patterns, options) {
      utils.resolve(patterns, options).forEach(function(fp) {
        app.emit('resolve', fp, options);
      });
    });
  };
};
