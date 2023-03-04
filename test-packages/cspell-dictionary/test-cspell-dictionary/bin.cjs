#!/usr/bin/env node

const assert = require('assert');
const { run } = require('./dist/cjs/index');

async function main() {
    assert(typeof run === 'function');
    assert(run('one'));
    console.log('done.');
}

main();
