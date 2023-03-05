#!/usr/bin/env node

import assert from 'assert';
import { fileURLToPath } from 'url';
import { run } from './dist/esm/index.mjs';

const __filename = fileURLToPath(import.meta.url);

async function main() {
    assert(typeof run === 'function');
    assert((await run(__filename)) === false);
    console.log('done.');
}

main();
