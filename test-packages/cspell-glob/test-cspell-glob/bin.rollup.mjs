#!/usr/bin/env node

import assert from 'assert';
import { basename } from 'path';
import { fileURLToPath } from 'url';
import { run } from './dist/esm/index.mjs';

const __filename = fileURLToPath(import.meta.url);

const expected = basename(__filename);

async function main() {
    assert(typeof run === 'function');
    assert(run(__filename) === expected);
    console.log('done.');
}

main();
