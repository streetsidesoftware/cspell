#!/usr/bin/env node

const assert = require('assert');
const { smokeTest } = require('./dist/index.cjs');

assert(smokeTest());
