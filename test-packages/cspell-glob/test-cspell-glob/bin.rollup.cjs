#!/usr/bin/env node

const assert = require('assert');
const { basename } = require('path');
const { run } = require('./dist/rollup/cjs/index.cjs');

const expected = basename(__filename);

async function main() {
    assert(typeof run === 'function');
    assert(run(__filename) === expected);
    console.log('done.');
}

main();
