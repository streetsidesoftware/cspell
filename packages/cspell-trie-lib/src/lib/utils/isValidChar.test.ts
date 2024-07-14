import { describe, expect, test } from 'vitest';

import { formatCharCodes, isValidChar } from './isValidChar.js';

describe('isValidChar', () => {
    test.each`
        char                  | expected
        ${''}                 | ${false}
        ${'a'}                | ${true}
        ${'ab'}               | ${false}
        ${'😀'}               | ${true}
        ${'😎'}               | ${true}
        ${'😎'[0]}            | ${false}
        ${'😎😀'.slice(0, 2)} | ${true}
        ${'😎😀'.slice(2)}    | ${true}
        ${'😎😀'.slice(1, 3)} | ${false}
        ${'\u0900'}           | ${true}
        ${'Ｗ'}               | ${true}
    `('isValidChar $char', ({ char, expected }) => {
        expect(isValidChar(char)).toBe(expected);
    });
});

describe('', () => {
    test.each`
        char                  | expected
        ${''}                 | ${''}
        ${'"'}                | ${'0x0022'}
        ${'a'}                | ${'0x0061'}
        ${'ab'}               | ${'0x0061:0x0062'}
        ${'😀'}               | ${'0xD83D:0xDE00'}
        ${'😎'}               | ${'0xD83D:0xDE0E'}
        ${'😎'[0]}            | ${'0xD83D'}
        ${'😎😀'.slice(0, 2)} | ${'0xD83D:0xDE0E'}
        ${'😎😀'.slice(2)}    | ${'0xD83D:0xDE00'}
        ${'😎😀'.slice(1, 3)} | ${'0xDE0E:0xD83D'}
        ${'"ऀ'}               | ${'0x0022:0x0900'}
        ${'\u0900'}           | ${'0x0900'}
        ${'Ｗ'}               | ${'0xFF37'}
    `('formatCharCodes $char', ({ char, expected }) => {
        expect(formatCharCodes(char)).toBe(expected);
    });
});
