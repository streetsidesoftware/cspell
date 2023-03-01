#!/usr/bin/env node

const assert = require('assert');
const { run } = require('./dist/rollup/cjs/index.cjs');

async function main() {
    assert(typeof run === 'function');
    assert(await run(__filename));
    console.log('done.');
}

main();
