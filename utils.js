'use strict';

var fs = require('fs');
var path = require('path');
var resolveCache = {};

/**
 * lazy requires
 */

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily require module dependencies
 */

require('extend-shallow', 'extend');
require('isobject', 'isObject');
require('array-unique', 'unique');
require('get-value', 'get');
require('matched', 'glob');
require('resolve-dir');
require('resolve-up');
require('inflection');
require('has-glob');

/**
 * Utils
 */

require = fn;

/**
 * Singularize the given `name`
 */

utils.single = function(name) {
  return utils.inflection.singularize(name);
};

/**
 * Pluralize the given `name`
 */

utils.plural = function(name) {
  return utils.inflection.pluralize(name);
};

/**
 * Cast `value` to an array
 */

utils.arrayify = function(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
};

/**
 * Try to require the given module name or filepath,
 * failing gracefully if an error is thrown.
 */

utils.tryRequire = function(name) {
  try {
    return require(name);
  } catch (err) {};

  try {
    return require(path.resolve(name));
  } catch (err) {};
  return null;
};

/**
 * Normalize config values to ensure that all of the necessary
 * properties are defined.
 */

utils.createConfig = function(config) {
  config = utils.extend({}, config);
  if (!config.single && config.method) {
    config.single = utils.single(config.method);
  }
  if (!config.plural && config.method) {
    config.plural = utils.plural(config.method);
  }
  return config;
};

/**
 * Resolve the paths to local and/or global npm modules that
 * match the given glob patterns.
 */

utils.resolve = function(patterns, options) {
  patterns = utils.arrayify(patterns);

  var key = patterns.join('');
  if (resolveCache.hasOwnProperty(key)) {
    return resolveCache[key];
  }

  try {
    var opts = utils.extend({cwd: '', realpath: true}, options);
    opts.cwd = utils.resolveDir(opts.cwd);
    var files = [];

    if (opts.resolveGlobal === true) {
      files = files.concat(utils.resolveUp(patterns, opts));
    }
    if (opts.resolveLocal !== false) {
      files = files.concat(utils.glob.sync(patterns, opts));
    }

  } catch (err) {
    return null;
  }

  files = utils.unique(files);
  resolveCache[key] = files;
  return files;
};

/**
 * Expose utils
 */

module.exports = utils;
