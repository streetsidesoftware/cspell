import { encodeTextToUtf8_32Rev, type TextCursor, type Utf8_32Rev } from './Utf8.ts';

/**
 * Represents the conversion state from text to utf8.
 *
 * - text - is the original text being processed.
 * - offset - is the current position in the text.
 * - code - is the current utf8 code being processed.
 */
export interface TextToUtf8Cursor extends TextCursor {
    /** the text */
    text: string;

    /**
     * the next offset in the text to be converted to utf8.
     *
     * **Note:** It is possible for `i` to be equal to `text.length` and `done` to be `false`,
     * This is because the character at `text.length -1` may be a multi-byte utf8 character
     * that has not been fully processed.
     */
    i: number;

    /**
     * Indicates that the end of the text has been reached.
     */
    done: undefined | boolean;

    /**
     * the current utf8 code being processed.
     *
     * If 0, the code needs to be (re)loaded and the offset moved forward.
     *
     * Take one byte at a time from the least significant byte.
     *
     * ```ts
     * const utf8Byte = t.code & 0xff;
     * ```
     */
    code: Utf8_32Rev;

    /**
     * Get the next byte from the utf8 code, loading a new code if needed.
     * @returns the next byte or 0 if at the end of the text.
     */
    next(): number | 0;

    /**
     * Get the current byte from the utf8 code.
     * Calling `cur()` will not advance the cursor. It is necessary to call `next()`.
     *
     * @returns the current byte or 0 if at the end of the text.
     */
    cur(): number | 0;
}

class Utf8CursorImpl implements TextToUtf8Cursor {
    text: string;
    i: number;
    code: Utf8_32Rev;
    done: boolean | undefined;

    constructor(text: string, i = 0) {
        this.text = text;
        this.i = i < 0 ? (i = text.length) : i;
        this.code = 0;
        this.done = i < 0 || i >= text.length ? true : undefined;
        this.cur();
    }

    cur(): number | 0 {
        if (this.done) return 0;
        this.code ||= encodeTextToUtf8_32Rev(this);
        return this.code & 0xff;
    }

    next(): number | 0 {
        if (this.done) return 0;
        this.code >>>= 8;
        this.code ||= encodeTextToUtf8_32Rev(this);
        this.done = !this.code && this.i >= this.text.length;
        const byte = this.code & 0xff;
        return byte;
    }
}

export function createTextToUtf8Cursor(text: string, offset: number = 0): TextToUtf8Cursor {
    return new Utf8CursorImpl(text, offset);
}
