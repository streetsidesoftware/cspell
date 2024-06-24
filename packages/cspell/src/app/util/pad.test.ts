import { describe, expect, test } from 'vitest';

import * as padJs from './pad.js';

describe('Validate Pad', () => {
    test.each`
        text       | n     | expected
        ${''}      | ${0}  | ${''}
        ${'hello'} | ${0}  | ${'hello'}
        ${'hello'} | ${-1} | ${'hello'}
        ${'a'}     | ${3}  | ${'  a'}
        ${'😀 😀'} | ${5}  | ${'  😀 😀'}
    `('padLeft $text', ({ text, n, expected }) => {
        expect(padJs.padLeft(text, n)).toBe(expected);
    });

    test.each`
        text         | n     | expected
        ${''}        | ${0}  | ${''}
        ${'hello'}   | ${0}  | ${'hello'}
        ${'hello'}   | ${-1} | ${'hello'}
        ${'a'}       | ${3}  | ${'a  '}
        ${'\u0009a'} | ${3}  | ${'\u0009a  '}
        ${'😀'}      | ${3}  | ${'😀  '}
        ${'😀 😀'}   | ${5}  | ${'😀 😀  '}
    `('pad $text', ({ text, n, expected }) => {
        expect(`|${padJs.pad(text, n)}|`.replaceAll(' ', '.')).toBe(`|${expected.replaceAll(' ', '.')}|`);
    });

    test.each`
        text         | expected
        ${''}        | ${0}
        ${'hello'}   | ${5}
        ${'a'}       | ${1}
        ${'\u0009a'} | ${1}
        ${'😀'}      | ${1}
        ${'😀 😀'}   | ${3}
    `('width $text', ({ text, expected }) => {
        expect(padJs.width(text)).toBe(expected);
    });
});
