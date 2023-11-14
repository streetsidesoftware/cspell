import { describe, expect, test } from 'vitest';

import { toError } from './error.js';

describe('errors', () => {
    test.each`
        err                    | expected
        ${Error('test')}       | ${Error('test')}
        ${{ message: 'test' }} | ${Error('test')}
        ${'test'}              | ${Error('test')}
        ${undefined}           | ${Error()}
    `('toError $err', ({ err, expected }) => {
        expect(toError(err)).toEqual(expected);
    });
});
