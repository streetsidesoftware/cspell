import { describe, expect, test } from 'vitest';

import { matchEntirePrefix } from './prefix.ts';
import { createUint8ArrayCursor } from './TypedArrayCursor.ts';
import { createTextToUtf8Cursor } from './Utf8Cursor.ts';

describe('prefix', () => {
    test('matchEntirePrefix whole word', () => {
        const text = 'hello';
        const buffer = new TextEncoder().encode(text);

        const textCursor = createTextToUtf8Cursor(text);
        const prefixCursor = createUint8ArrayCursor(buffer);

        expect(matchEntirePrefix(textCursor, prefixCursor)).toBe(true);
    });

    test.each`
        text          | prefix      | offset | expected | comment
        ${'hello'}    | ${'hello!'} | ${0}   | ${false} | ${'prefix longer than text'}
        ${'hello'}    | ${'hel'}    | ${0}   | ${true}  | ${'prefix shorter than text'}
        ${'rake'}     | ${'cake'}   | ${0}   | ${false} | ${'prefix same length no match'}
        ${'hello'}    | ${'help'}   | ${0}   | ${false} | ${'different ending'}
        ${'😀🎉'}     | ${'😀'}     | ${0}   | ${true}  | ${'emoji'}
        ${'😀🎉 fun'} | ${'😀🎉'}   | ${1}   | ${true}  | ${'emoji with offset 1'}
    `('matchEntirePrefix $comment: $text, $prefix $offset, $expected', ({ text, prefix, offset, expected }) => {
        const prefixBuffer = new TextEncoder().encode(prefix);

        const textCursor = createTextToUtf8Cursor(text);
        const prefixCursor = createUint8ArrayCursor(prefixBuffer.subarray(offset));

        textCursor.cur(); // Initialize cursor position
        for (let i = 0; i < offset; i++) {
            textCursor.next();
        }

        expect(matchEntirePrefix(textCursor, prefixCursor)).toBe(expected);
    });

    test('matchEntirePrefix no match', () => {
        const text = 'hello';
        const prefix = 'help';
        const prefixBuffer = new TextEncoder().encode(prefix);

        const textCursor = createTextToUtf8Cursor(text);
        const prefixCursor = createUint8ArrayCursor(prefixBuffer);

        expect(matchEntirePrefix(textCursor, prefixCursor)).toBe(false);
    });
});
