import { describe, expect, test } from 'vitest';

import { sumValues } from './index.mjs';

describe('index', () => {
    test.each`
        values    | expected
        ${[]}     | ${0}
        ${[1, 2]} | ${3}
    `('sumValues', ({ values, expected }) => {
        expect(sumValues(values)).toBe(expected);
    });
});
