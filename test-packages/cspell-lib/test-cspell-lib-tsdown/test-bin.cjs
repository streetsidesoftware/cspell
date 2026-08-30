#!/usr/bin/env node

const { run } = require('./dist/index.cjs');

console.log('Starting test-bin.cjs');

run().finally(
    () => console.log('Finished test-bin.cjs')
);
