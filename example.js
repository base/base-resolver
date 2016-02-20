'use strict';

var resolver = require('./');
var Base = require('base');
var base = new Base();
base.use(resolver());

base.generators.resolve('generate-*/{generator,index}.js');
base.generators.resolve('verb-*/{verbfile,index}.js');

console.log(base.generators.name('generate-node'));
console.log(base.generators.alias('mocha'));
console.log(base.generators);
