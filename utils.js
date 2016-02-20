'use strict';

/**
 * Module dependencies
 */

var utils = require('lazy-cache')(require);

var fn = require;
require = utils;
require('extend-shallow', 'extend');
require('resolve-modules', 'Resolver');
require('arr-union', 'union');
require = fn;

/**
 * Expose `utils` modules
 */

module.exports = utils;
