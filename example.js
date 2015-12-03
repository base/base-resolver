'use strict';

var resolver = require('./');
var Generate = require('base-methods');
var gm = require('global-modules');

Generate.use(function(app) {
  app.generators = {};
  app.define('register', function(key, config) {
    this.generators[key] = config;
    return this;
  });
});
Generate.use(resolver('generate'));



var generate = new Generate();
generate.on('config', function(config) {
  console.log('registered:', config.alias);
  generate.register(config.alias, config);
});

generate.resolve('generate-*/generator.js', {cwd: gm});
console.log(generate);
