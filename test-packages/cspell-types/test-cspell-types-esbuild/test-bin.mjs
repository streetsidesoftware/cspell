#!/usr/bin/env node

// ts-check
import assert from 'node:assert';
import fs from 'node:fs/promises';

import { gatherIssues } from './dist/index.cjs';

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

await test('gatherIssues', () => {
    assert(gatherIssues('hello').length === 1);
});

await test('filesize index.cjs', async () => {
    const stats = await fs.stat('dist/index.cjs');
    assert(stats.size > 0, 'File size is greater than 0');
    assert(stats.size <= 1024 * 10, 'Try to keep it small');
});

await test('filesize index.mjs', async () => {
    const stats = await fs.stat('dist/index.mjs');
    assert(stats.size > 0, 'File size is greater than 0');
    assert(stats.size <= 1024 * 10, 'Try to keep it small');
});

if (failed) {
    process.exitCode = 1;
}
