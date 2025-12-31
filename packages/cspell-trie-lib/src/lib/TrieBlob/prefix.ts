import type { U8Array } from './TypedArray.ts';
import type { Uint8ArrayCursor } from './TypedArrayCursor.ts';
import type { TextToUtf8Cursor } from './Utf8Cursor.ts';

/**
 * Represents a prefix and the current offset in that prefix.
 */
export interface PrefixOffset {
    prefix: U8Array;
    offset: number;
}

export function matchEntirePrefix(text: TextToUtf8Cursor, prefix: Uint8ArrayCursor): boolean {
    while (!prefix.done) {
        const byte = prefix.cur();
        const charVal = text.cur();
        console.log('%o', { prefix, text, byte, charVal });
        if (text.done || byte !== charVal) return false;
        prefix.next();
        text.next();
    }

    return true;
}
