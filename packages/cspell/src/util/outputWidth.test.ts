import { describe, expect, test } from 'vitest';

import { getOutputWidth } from './outputWidth.js';

describe('getOutputWidth', () => {
    test.each`
        columns      | streamColumns | expected
        ${undefined} | ${undefined}  | ${undefined}
        ${undefined} | ${100}        | ${100}
        ${'72'}      | ${100}        | ${72}
        ${' 72 '}    | ${undefined}  | ${72}
        ${''}        | ${100}        | ${100}
        ${'0'}       | ${100}        | ${100}
        ${'-5'}      | ${100}        | ${100}
        ${'7.5'}     | ${100}        | ${100}
        ${'wide'}    | ${100}        | ${100}
    `('COLUMNS=$columns stream.columns=$streamColumns', ({ columns, streamColumns, expected }) => {
        expect(getOutputWidth({ columns: streamColumns }, { COLUMNS: columns })).toBe(expected);
    });
});
