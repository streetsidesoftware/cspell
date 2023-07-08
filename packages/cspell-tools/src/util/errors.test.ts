import { describe, expect, test } from 'vitest';

import { isError, toError } from './errors.js';

describe('errors', () => {
    test.each`
        err            | expected
        ${1}           | ${false}
        ${undefined}   | ${false}
        ${new Error()} | ${true}
    `('isError', ({ err, expected }) => {
        expect(isError(err)).toBe(expected);
    });

    test.each`
        err                   | expected
        ${1}                  | ${Error('1')}
        ${undefined}          | ${Error('undefined')}
        ${new Error('hello')} | ${Error('hello')}
        ${{ name: 'Err' }}    | ${Error('[object Object]')}
    `('toError', ({ err, expected }) => {
        expect(toError(err)).toEqual(expected);
    });
});
