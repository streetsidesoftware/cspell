import { basename } from 'path';
import { describe, expect, test } from 'vitest';

import { run } from './index.js';

describe('run', () => {
    test.each`
        glob          | expected
        ${__filename} | ${'src/' + basename(__filename)}
        ${'*.md'}     | ${'*.md'}
    `('run', ({ glob, expected }) => {
        expect(run(glob)).toBe(expected);
    });
});
