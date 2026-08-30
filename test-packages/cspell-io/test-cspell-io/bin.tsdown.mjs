#!/usr/bin/env node

import assert from 'node:assert';

import { run } from './dist/tsdown/index.js';

async function main() {
    assert(typeof run === 'function');
    assert(await run(import.meta.url));
    console.log('done.');
}

main();
