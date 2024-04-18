import { resolve } from 'node:path';

import { describe, expect, test } from 'vitest';

import { run } from './index.js';

describe('index', () => {
    test.each`
        filename              | expected
        ${__filename}         | ${false}
        ${'../dist/index.js'} | ${true}
    `('run $filename', async ({ filename, expected }) => {
        filename = resolve(__dirname, filename);
        expect(await run(filename)).toBe(expected);
    });
});
