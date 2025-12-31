import { describe, expect, test } from 'vitest';

import { createTextToUtf8Cursor } from './Utf8Cursor.js';

describe('TextToUtf8Cursor', () => {
    test('should create a cursor', () => {
        const cursor = createTextToUtf8Cursor('hello');
        expect(cursor.i).toBe(1);
    });

    test('should read single byte characters', () => {
        const cursor = createTextToUtf8Cursor('abc');
        expect(cursor.cur()).toBe('a'.codePointAt(0));
        expect(cursor.next()).toBe('b'.codePointAt(0));
        expect(cursor.done).toBeFalsy();
        expect(cursor.next()).toBe('c'.codePointAt(0));
        expect(cursor.done).toBeFalsy();
        expect(cursor.next()).toBe(0);
        expect(cursor.done).toBe(true);
    });

    test('should read multi-byte UTF-8 characters', () => {
        const text = 'café';
        const buffer = new TextEncoder().encode(text);

        const result: number[] = [];
        for (const cursor = createTextToUtf8Cursor(text); !cursor.done; cursor.next()) {
            result.push(cursor.cur());
        }

        expect(result).toEqual([...buffer]);
    });

    test('should read emoji characters', () => {
        const text = '😀🎉';
        const buffer = new TextEncoder().encode(text);

        const result: number[] = [];
        for (const cursor = createTextToUtf8Cursor(text); !cursor.done; cursor.next()) {
            result.push(cursor.cur());
        }

        expect(result).toEqual([...buffer]);
    });

    test('should handle empty string', () => {
        const cursor = createTextToUtf8Cursor('');
        expect(cursor.done).toBe(true);
        expect(cursor.next()).toBe(0);
    });

    test('should handle offset', () => {
        const text = 'hello';
        const cursor = createTextToUtf8Cursor(text, 2);
        expect(cursor.cur()).toBe('l'.codePointAt(0));
        expect(cursor.next()).toBe('l'.codePointAt(0));
        expect(cursor.next()).toBe('o'.codePointAt(0));
        expect(cursor.done).toBeFalsy();
        expect(cursor.next()).toBe(0);
        expect(cursor.done).toBe(true);
    });
});
