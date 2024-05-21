import { describe, expect, test } from 'vitest';

import { toError } from './error.js';

describe('errors', () => {
    test.each`
        err                    | expected
        ${new Error('test')}   | ${new Error('test')}
        ${{ message: 'test' }} | ${new Error('test')}
        ${'test'}              | ${new Error('test')}
        ${undefined}           | ${new Error()}
    `('toError $err', ({ err, expected }) => {
        expect(toError(err)).toEqual(expected);
    });
});
