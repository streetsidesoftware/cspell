import { describe, expect, test } from 'vitest';

import { TypedArrayCursor } from './TypedArrayCursor.ts';

describe('TypedArrayCursor', () => {
    test('should create a cursor from a Uint8Array', () => {
        const arr = new Uint8Array([1, 2, 3, 4, 5]);
        const cursor = new TypedArrayCursor(arr);
        expect(cursor.i).toBe(0);
        expect(cursor.length).toBe(5);
    });

    test('should read values at current index', () => {
        const arr = new Uint8Array([10, 20, 30, 40, 50]);
        const cursor = new TypedArrayCursor(arr);
        expect(cursor.cur()).toBe(10);
        cursor.i = 2;
        expect(cursor.cur()).toBe(30);
    });

    test('should advance the cursor', () => {
        const arr = new Uint8Array([1, 2, 3, 4, 5]);
        const cursor = new TypedArrayCursor(arr);
        expect(cursor.i).toBe(0);
        expect(cursor.next()).toBe(2);
        cursor.next();
        expect(cursor.i).toBe(2);
        cursor.next();
        expect(cursor.i).toBe(3);
    });

    test('should handle Uint16Array', () => {
        const arr = new Uint16Array([100, 200, 300]);

        const values: number[] = [];
        for (const cursor = new TypedArrayCursor(arr); !cursor.done; cursor.next()) {
            values.push(cursor.cur() || 0);
        }

        expect(values).toEqual([...arr]);
    });

    test('should handle Uint32Array', () => {
        const arr = new Uint32Array([1000, 2000, 3000]);
        const values: number[] = [];
        for (const cursor = new TypedArrayCursor(arr); !cursor.done; cursor.next()) {
            values.push(cursor.cur() || 0);
        }

        expect(values).toEqual([...arr]);
    });
});
