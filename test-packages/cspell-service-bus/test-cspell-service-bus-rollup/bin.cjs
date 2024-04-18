#!/usr/bin/env node

const assert = require('node:assert');
const { smokeTest } = require('./dist/index.cjs');

assert(smokeTest());
