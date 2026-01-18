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

    test('walkToJSONObj complex object', () => {
        const obj = {
            a: 1,
            b: 'string',
            c: {
                d: true,
                e: [1, 2, 3, { f: 'nested' }],
            },
            g: new Map<string, any>([['key1', 'value1'] as const, ['key2', { h: 'value2' }] as const]),
            i: new Set([1, 2, 3]),
        };
        // Create a circular reference
        (obj.c as any).circular = obj;

        const result = walkToJSONObj(obj);
        const expected = {
            a: 1,
            b: 'string',
            c: {
                d: true,
                e: [1, 2, 3, { f: 'nested' }],
                circular: '[Circular]',
            },
            g: [
                ['key1', 'value1'],
                ['key2', { h: 'value2' }],
            ],
            i: [1, 2, 3],
        };
        // Adjust expected to account for circular reference handling
        (expected.c.circular as any) = expected;

        expect(result).toEqual(expected);
    });
});

function roundTripJSON(value: unknown): unknown {
    return JSON.parse(JSON.stringify(value));
}
