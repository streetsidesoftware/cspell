#!/usr/bin/env node

import assert from 'assert';
import { run } from './dist/esm/index.mjs';

assert(typeof run === 'function');
assert(run());
console.log('done.');
