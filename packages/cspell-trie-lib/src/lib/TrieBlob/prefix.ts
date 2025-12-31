import type { U8Array } from './TypedArray.ts';
import type { Utf8_32Rev } from './Utf8.ts';
import { encodeTextToUtf8_32Rev } from './Utf8.ts';

/**
 * Represents the conversion state from text to utf8.
 *
 * - text - is the original text being processed.
 * - offset - is the current position in the text.
 * - code - is the current utf8 code being processed.
 */
export interface TextOffsetCode {
    /** the text */
    text: string;
    /**
     * the next offset in the text to be converted to utf8.
     */
    offset: number;
    /**
     * the current utf8 code being processed.
     *
     * If 0, the code needs to be (re)loaded and the offset moved forward.
     *
     * Take one byte at a time from the least significant byte.
     *
     * ```ts
     * const utf8Byte = t.code & 0xff;
     * t.code >>>= 8;
     * ```
     */
    code: Utf8_32Rev;
}

/**
 * Represents a prefix and the current offset in that prefix.
 */
export interface PrefixOffset {
    prefix: U8Array;
    offset: number;
}

/**
 * Consumes the text offset code and matches it against the prefix at the current offset.
 * @param t - the text offset code
 * @param p - the prefix and offset
 * @returns true if the prefix matches the text at the current offset
 */
export function matchPrefix(t: TextOffsetCode, p: PrefixOffset): boolean {
    if (p.offset >= p.prefix.length) return true;
    if (!t.code && t.offset >= t.text.length) return false;

    const prefix = p.prefix;
    const len = prefix.length;

    t.code = t.code || encodeTextToUtf8_32Rev(t);
    for (; p.offset < len; ++p.offset) {
        const charVal = t.code & 0xff;
        if (prefix[p.offset] !== charVal) {
            return false;
        }
        t.code >>>= 8;
        t.code = t.code || encodeTextToUtf8_32Rev(t);
    }

    return true;
}

export function matchEntirePrefix(p: TextOffsetCode, prefix: U8Array | undefined): boolean {
    if (!prefix?.length) return true;

    const len = prefix.length;
    for (let i = 0; i < len; ++i) {
        const charVal = p.code & 0xff;
        if (prefix[i] !== charVal) return false;
        p.code >>>= 8;
        p.code = p.code || encodeTextToUtf8_32Rev(p);
    }

    return true;
}
