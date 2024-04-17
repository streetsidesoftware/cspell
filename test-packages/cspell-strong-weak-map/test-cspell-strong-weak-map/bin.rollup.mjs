#!/usr/bin/env node

import assert from 'node:assert';

import { run } from './dist/rollup/esm/index.mjs';

assert(typeof run === 'function');
assert(run());
console.log('done.');
