#!/usr/bin/env node

const assert = require('node:assert');
const { run } = require('./dist/tsdown/index.cjs');

async function main() {
    assert(typeof run === 'function');
    assert(await run(__filename));
    console.log('done.');
}

main();
