import { describe, expect, test } from 'vitest';

import { sizeToNumber, validateUnitSize } from './unitNumbers.js';

describe('Validate unitNumbers', () => {
    test.each`
        value     | expected
        ${'22'}   | ${undefined}
        ${'22kb'} | ${undefined}
        ${'22 s'} | ${'Invalid size.'}
        ${'22s'}  | ${'Unknown units. Valid units are: B, K, KB, M, MB, G, GB.'}
    `('validateUnitSize $value', ({ value, expected }) => {
        expect(validateUnitSize(value)).toBe(expected);
    });

    test.each`
        value       | expected
        ${'22'}     | ${22}
        ${'22kb'}   | ${22 * 1024}
        ${'0.5mb'}  | ${0.5 * 1024 * 1024}
        ${'.5mb'}   | ${0.5 * 1024 * 1024}
        ${'1.75GB'} | ${1.75 * 1024 * 1024 * 1024}
        ${''}       | ${Number.NaN}
        ${'twenty'} | ${Number.NaN}
        ${'22 s'}   | ${Number.NaN}
        ${'22s'}    | ${Number.NaN}
    `('sizeToNumber $value', ({ value, expected }) => {
        expect(sizeToNumber(value)).toBe(expected);
    });
});
