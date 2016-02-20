/*!
 * base-resolver <https://github.com/jonschlinkert/base-resolver>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var utils = require('./utils');

module.exports = function(prop, config) {
  if (typeof prop !== 'string') {
    config = prop;
    prop = null;
  }

  prop = prop || 'generators';

  return function(app) {
    if (this.isRegistered('base-resolver')) return;

    var opts = utils.extend({}, config, this.options);
    if (this.fragment) {
      opts.fragment = this.fragment;
    }

    this[prop] = new utils.Resolver(opts);
    if (!this.fragment) {
      this.fragment = this[prop].fragment;
    }
  };
};

