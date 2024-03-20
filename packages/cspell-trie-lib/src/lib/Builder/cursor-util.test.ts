import { describe, expect, test } from 'vitest';

import { commonStringPrefixLen } from './cursor-util.js';

describe('cursor-util', () => {
    test.each`
        a          | b          | expected
        ${'hello'} | ${'hello'} | ${5}
        ${'hello'} | ${'world'} | ${0}
        ${'hello'} | ${'help'}  | ${3}
        ${':😀'}   | ${':😃'}   | ${1}
    `('commonPrefixLen $a $b', ({ a, b, expected }) => {
        expect(commonStringPrefixLen(a, b)).toBe(expected);
    });
});
