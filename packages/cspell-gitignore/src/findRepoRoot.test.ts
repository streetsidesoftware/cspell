import * as path from 'node:path';

import { describe, expect, test } from 'vitest';

import { findRepoRoot } from './findRepoRoot.js';

describe('helpers', () => {
    test.each`
        dir                              | expected
        ${__dirname}                     | ${path.join(__dirname, '../../..')}
        ${new URL('.', import.meta.url)} | ${path.join(__dirname, '../../..')}
        ${'/'}                           | ${undefined}
        ${'stdin:/'}                     | ${undefined}
        ${new URL('stdin:/')}            | ${undefined}
    `('findRepoRoot $dir', async ({ dir, expected }) => {
        const f = await findRepoRoot(dir);
        expect(f ? path.join(f, '.') : f).toEqual(expected);
    });
});
