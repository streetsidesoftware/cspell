#!/usr/bin/env node

const assert = require('assert');
const { run } = require('./dist/cjs/index');

async function main() {
    assert(typeof run === 'function');
    assert(await run(__filename));
    console.log('done.');
}

main();
