#!/usr/bin/env node

import assert from 'node:assert';

import { run } from './dist/index.js';

assert(typeof run === 'function');
assert(run());
console.log('done.');
