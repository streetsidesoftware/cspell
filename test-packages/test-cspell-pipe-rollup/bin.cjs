#!/usr/bin/env node
/* eslint-disable node/shebang */

const assert = require('assert');
const { sumValues } = require('./dist/index.cjs');

assert(sumValues([1, 2, 3]) === 6);
