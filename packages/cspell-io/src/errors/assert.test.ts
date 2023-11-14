import { describe, expect, test } from 'vitest';

import { assert } from './assert.js';
import { AssertionError } from './errors.js';

describe('assert', () => {
    test.each`
        value
        ${true}
        ${'hello'}
        ${{}}
    `('assert $value', ({ value }) => {
        expect(() => assert(value)).not.toThrow();
    });

    test.each`
        value        | message      | expected
        ${false}     | ${'test'}    | ${new AssertionError('test')}
        ${0}         | ${undefined} | ${new AssertionError('Assertion failed')}
        ${undefined} | ${null}      | ${new AssertionError('Assertion failed')}
        ${null}      | ${''}        | ${new AssertionError('')}
        ${NaN}       | ${'NaN'}     | ${new AssertionError('NaN')}
    `('failed assert $value', ({ value, message, expected }) => {
        expect(() => assert(value, message)).toThrow(expected);
    });
});
