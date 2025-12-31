import { describe, expect, test } from 'vitest';

import { createTextToUtf8Cursor } from './Utf8Cursor.js';

describe('TextToUtf8Cursor', () => {
    test('should create a cursor from a buffer', () => {
        const cursor = createTextToUtf8Cursor('hello');
        expect(cursor.i).toBe(0);
    });

    test('should read single byte characters', () => {
        const cursor = createTextToUtf8Cursor('abc');
        expect(cursor.next()).toBe('a'.codePointAt(0));
        expect(cursor.next()).toBe('b'.codePointAt(0));
        expect(cursor.done).toBeFalsy();
        expect(cursor.next()).toBe('c'.codePointAt(0));
        expect(cursor.done).toBe(true);
    });

    test('should read multi-byte UTF-8 characters', () => {
        const text = 'café';
        const cursor = createTextToUtf8Cursor(text);
        const buffer = new TextEncoder().encode(text);
        expect(cursor.next()).toBe(buffer[0]);
        expect(cursor.next()).toBe(buffer[1]);
        expect(cursor.next()).toBe(buffer[2]);
        expect(cursor.next()).toBe(buffer[3]);
        expect(cursor.done).toBeFalsy();
        expect(cursor.i).toBe(text.length);
        expect(cursor.next()).toBe(buffer[4]);
        expect(cursor.done).toBe(true);
        expect(cursor.i).toBe(text.length);
    });

    test('should read emoji characters', () => {
        const text = '😀🎉';
        const buffer = new TextEncoder().encode(text);
        const cursor = createTextToUtf8Cursor(text);

        for (const byte of buffer) {
            expect(cursor.next()).toBe(byte);
        }
        expect(cursor.done).toBe(true);
    });

    test('should handle empty string', () => {
        const cursor = createTextToUtf8Cursor('');
        expect(cursor.done).toBe(true);
        expect(cursor.next()).toBe(0);
    });

    test('should handle offset', () => {
        const text = 'hello';
        const cursor = createTextToUtf8Cursor(text, 2);
        expect(cursor.next()).toBe('l'.codePointAt(0));
        expect(cursor.next()).toBe('l'.codePointAt(0));
        expect(cursor.next()).toBe('o'.codePointAt(0));
        expect(cursor.done).toBe(true);
    });
});
