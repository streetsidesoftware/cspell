import { describe, expect, test } from 'vitest';

import { isError, toError } from './errors.js';

describe('errors', () => {
    test.each`
        err                 | expected
        ${1}                | ${false}
        ${undefined}        | ${false}
        ${new Error('msg')} | ${true}
    `('isError', ({ err, expected }) => {
        expect(isError(err)).toBe(expected);
    });

    test.each`
        err                   | expected
        ${1}                  | ${new Error('1')}
        ${undefined}          | ${new Error('undefined')}
        ${new Error('hello')} | ${new Error('hello')}
        ${{ name: 'Err' }}    | ${new Error('[object Object]')}
    `('toError', ({ err, expected }) => {
        expect(toError(err)).toEqual(expected);
    });
});
