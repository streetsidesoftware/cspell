#!/usr/bin/env node

import assert from 'node:assert';

import { run } from './dist/tsdown/index.js';

async function main() {
    assert(typeof run === 'function');
    assert(run('one'));
    console.log('done.');
}

main();
