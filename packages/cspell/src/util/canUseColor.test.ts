import { afterEach, describe, expect, test } from 'vitest';

import { canUseColor } from './canUseColor.js';

describe('canUseColor', () => {
    afterEach(() => {
        delete process.env['NO_COLOR'];
    });
    test.each`
        color        | NO_COLOR     | expected
        ${undefined} | ${undefined} | ${undefined}
        ${undefined} | ${''}        | ${undefined}
        ${undefined} | ${'false'}   | ${undefined}
        ${undefined} | ${'true'}    | ${false}
        ${undefined} | ${'0'}       | ${false}
        ${true}      | ${undefined} | ${true}
        ${true}      | ${'true'}    | ${true}
        ${false}     | ${undefined} | ${false}
        ${false}     | ${'true'}    | ${false}
    `('canUseColor $color, $NO_COLOR, $expected', ({ color, NO_COLOR, expected }) => {
        if (NO_COLOR !== undefined) process.env['NO_COLOR'] = NO_COLOR;
        expect(canUseColor(color)).toBe(expected);
    });
});
