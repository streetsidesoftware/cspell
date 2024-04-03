import { describe, expect, test } from 'vitest';

import { assertValidUtf16Character, expandCharacterSet, expandRange, isValidUtf16Character } from './text.js';

describe('text', () => {
    test.each`
        a           | b           | expected
        ${''}       | ${''}       | ${[]}
        ${'a'}      | ${'c'}      | ${['a', 'b', 'c']}
        ${'😁'}     | ${'😃'}     | ${['😁', '😂', '😃']}
        ${'\u0300'} | ${'\u0302'} | ${['\u0300', '\u0301', '\u0302']}
        ${'aa'}     | ${'ca'}     | ${['a', 'b', 'c']}
        ${'apple'}  | ${'cat'}    | ${['a', 'b', 'c']}
        ${'b'}      | ${'a'}      | ${[]}
        ${'b'}      | ${'b'}      | ${['b']}
    `('expandRange "$a" -> "$b"', ({ a, b, expected }) => {
        expect(expandRange(a, b)).toEqual(expected);
    });

    test.each`
        line          | expected
        ${''}         | ${[]}
        ${'a-c'}      | ${['a', 'b', 'c']}
        ${'😁-😃'}    | ${['😁', '😂', '😃']}
        ${'b'}        | ${['b']}
        ${'c-a'}      | ${['a', 'c']}
        ${'-c-a'}     | ${['a', 'c', '-']}
        ${'a-cA-CZ-'} | ${['a', 'b', 'c', 'A', 'B', 'C', 'Z', '-']}
    `('expandCharacterSet "$line"', ({ line, expected }) => {
        expect(expandCharacterSet(line)).toEqual(new Set(expected));
    });

    test.each`
        char             | expected
        ${'a'}           | ${true}
        ${'a'}           | ${true}
        ${'ab'}          | ${false}
        ${''}            | ${false}
        ${'😁'}          | ${true}
        ${'😁'[0]}       | ${false}
        ${'😁'[1]}       | ${false}
        ${'😁'[1] + '.'} | ${false}
    `('isValidUtf16Character $char', ({ char, expected }) => {
        expect(isValidUtf16Character(char)).toBe(expected);
    });

    test('assertValidUtf16Character', () => {
        expect(() => assertValidUtf16Character('a')).not.toThrow();
        expect(() => assertValidUtf16Character('ab')).toThrow(
            'Invalid utf16 character, not a valid surrogate pair: [0x0061, 0x0062]',
        );
    });

    test.each`
        char             | expected
        ${'😁'[0]}       | ${'Invalid utf16 character, lone surrogate: 0xd83d'}
        ${'😁'[1]}       | ${'Invalid utf16 character, lone surrogate: 0xde01'}
        ${'😁'[1] + '.'} | ${'Invalid utf16 character, not a valid surrogate pair: [0xde01, 0x002e]'}
        ${'😁'[0] + '.'} | ${'Invalid utf16 character, not a valid surrogate pair: [0xd83d, 0x002e]'}
        ${'😁😁'}        | ${'Invalid utf16 character, must be a single character, found: 4'}
    `('assertValidUtf16Character $char', ({ char, expected }) => {
        expect(() => assertValidUtf16Character(char)).toThrow(expected);
    });
});
