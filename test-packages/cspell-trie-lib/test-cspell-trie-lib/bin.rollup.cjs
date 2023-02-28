#!/usr/bin/env node

const assert = require('assert');
const { run } = require('./dist/rollup/cjs/index.cjs');

assert(typeof run === 'function');
assert(run());
console.log('done.');
