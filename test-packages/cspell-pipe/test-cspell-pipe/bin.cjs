#!/usr/bin/env node

const assert = require('assert');
const { sumValues, sumValuesSync } = require('./dist/index');

assert(sumValues([1, 2, 3]) === 6);
assert(sumValuesSync([1, 2, 3]) === 6);
