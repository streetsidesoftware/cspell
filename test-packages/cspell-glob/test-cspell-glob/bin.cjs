#!/usr/bin/env node

const { basename } = require('path');

const assert = require('assert');
const { run } = require('./dist/cjs/index');

const expected = basename(__filename);

async function main() {
    assert(typeof run === 'function');
    assert(run(__filename) === expected);
    console.log('done.');
}

main();
