import { describe, expect, test } from 'vitest';

import { walkToJSONObj } from './settingsToJson.js';

describe('walkToJSONObj', () => {
    test.each`
        value        | expected
        ${null}      | ${null}
        ${undefined} | ${undefined}
        ${true}      | ${true}
        ${false}     | ${false}
        ${42}        | ${42}
        ${'hello'}   | ${'hello'}
        ${/abc/i}    | ${'/abc/i'}
        ${18n}       | ${18n}
    `('walkToJSONObj basic $value', ({ value, expected }) => {
        const result = walkToJSONObj(value);
        expect(result).toBe(expected);
    });

    test.each`
        value                  | expected
        ${new String('hello')} | ${roundTripJSON(new String('hello'))}
    `('walkToJSONObj  edge cases $value', ({ value, expected }) => {
        const result = walkToJSONObj(value);
        expect(result).toBe(expected);
    });

    test.each`
        value         | expected
        ${myFunc}     | ${undefined}
        ${() => true} | ${undefined}
        ${Date}       | ${undefined}
        ${String}     | ${undefined}
    `('walkToJSONObj function edge cases $value', ({ value, expected }) => {
        const result = walkToJSONObj(value);
        expect(result).toBe(expected);
    });

    function myFunc() {
        return 'test';
    }
});

function roundTripJSON(value: unknown): unknown {
    return JSON.parse(JSON.stringify(value));
}
