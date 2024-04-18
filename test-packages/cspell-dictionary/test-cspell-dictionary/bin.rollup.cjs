#!/usr/bin/env node

const assert = require('node:assert');
const { run } = require('./dist/rollup/cjs/index.cjs');

async function main() {
    assert(typeof run === 'function');
    assert(run('one'));
    console.log('done.');
}

main();
