#!/usr/bin/env node

const assert = require('assert');
const { run } = require('./dist/cjs/index');

assert(typeof run === 'function');
assert(run());
console.log('done.');
