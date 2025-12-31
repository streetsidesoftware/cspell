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
    if (prefix.done) return true;

    for (let byte = prefix.cur(), charVal = text.cur(); !prefix.done; byte = prefix.next(), charVal = text.next()) {
        if (byte !== charVal) return false;
    }

    return true;
}
