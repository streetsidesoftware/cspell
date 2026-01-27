import { describe, expect, test } from 'vitest';

import { assert, AssertionError } from './assert.js';

describe('Assert Tests', () => {
    test('Assert Pass', () => {
        expect(assert(true)).toBe(undefined);
        expect(assert(1)).toBe(undefined);
        expect(assert({})).toBe(undefined);
    });

    test('Assert Fail', () => {
        expect(() => assert(false)).toThrow('Assertion failed');
        expect(() => assert(0)).toThrow('Assertion failed');
        expect(() => assert(null)).toThrow('Assertion failed');
        expect(() => assert(undefined, 'Custom message')).toThrow(new AssertionError('Custom message'));
    });
});
