#!/usr/bin/env node

import assert from 'node:assert';
import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';

import { run } from './dist/tsdown/index.js';

const __filename = fileURLToPath(import.meta.url);

const expected = '/' + basename(__filename);

async function main() {
    assert(typeof run === 'function');
    const result = run(__filename);
    assert(result === expected, `Expect "${result}" to equal "${expected}"`);
    console.log('done.');
}

main();
