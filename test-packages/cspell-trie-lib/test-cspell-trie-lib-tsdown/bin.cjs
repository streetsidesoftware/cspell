#!/usr/bin/env node

const assert = require('node:assert');
const { run } = require('./dist/index.cjs');

assert(typeof run === 'function');
assert(run());
console.log('done.');
