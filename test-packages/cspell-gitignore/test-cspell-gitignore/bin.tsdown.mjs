#!/usr/bin/env node

import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

import { run } from './dist/tsdown/index.js';

const __filename = fileURLToPath(import.meta.url);

async function main() {
    assert(typeof run === 'function');
    assert((await run(__filename)) === false);
    console.log('done.');
}

main();
