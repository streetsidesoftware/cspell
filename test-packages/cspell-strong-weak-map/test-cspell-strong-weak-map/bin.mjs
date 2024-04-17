#!/usr/bin/env node

import assert from 'assert';

import { run } from './dist/esm/index.js';

assert(typeof run === 'function');
assert(run());
console.log('done.');
