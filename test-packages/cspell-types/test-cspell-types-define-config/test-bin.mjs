#!/usr/bin/env node

import './dist/index.js';

import assert from 'node:assert';
import fs from 'node:fs/promises';

let failed = 0;

async function test(name, fn) {
    try {
        console.error(`Testing: ${name}`);
        await fn();
    } catch (e) {
        console.error(`Failed: ${name}`);
        console.error(e);
        failed += 1;
    }
}

function assertLessThan(a, b) {
    assert(a < b, `assert that ${a} is less than ${b}`);
}

await test('filesize index.cjs', async () => {
    const stats = await fs.stat('dist/index.cjs');
    assert(stats.size > 0, 'File size is greater than 0');
    assertLessThan(stats.size, 3096);
});

await test('filesize index.js', async () => {
    const stats = await fs.stat('dist/index.js');
    assert(stats.size > 0, 'File size is greater than 0');
    assertLessThan(stats.size, 2048);
});

if (failed) {
    process.exitCode = 1;
}
