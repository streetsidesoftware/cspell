#!/usr/bin/env node

import { run } from './dist/index.js';

console.log('Starting test-bin.mjs');

await run();

console.log('Finished test-bin.mjs');
