/* eslint-disable unicorn/prefer-code-point */

/**
 * A utf8 value represented as 32bit number
 *
 * Utf8_32 number are comparable in utf8 order.
 *
 *            hightest byte           lowest byte   Code Point Range
 * - 1 byte:  00000000 00000000 00000000 0xxxxxxx - 0x0000_0000 - 0x0000_007f
 * - 2 bytes: 00000000 00000000 110xxxxx 10xxxxxx - 0x0000_0080 - 0x0000_07ff
 * - 3 bytes: 00000000 1110xxxx 10xxxxxx 10xxxxxx - 0x0000_0800 - 0x0000_ffff
 * - 4 bytes: 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx - 0x0001_0000 - 0x001f_ffff
 *
 */
export type Utf8_32 = number;

/**
 * A utf8 value represented as little endian 32bit number
 *
 * These numbers DO NOT sort into the correct order for utf8.
 *
 *            hightest byte           lowest byte   Code Point Range
 * - 1 byte:  00000000 00000000 00000000 0xxxxxxx - 0x0000_0000 - 0x0000_007f
 * - 2 bytes: 00000000 00000000 10xxxxxx 110xxxxx - 0x0000_0080 - 0x0000_07ff
 * - 3 bytes: 00000000 10xxxxxx 10xxxxxx 1110xxxx - 0x0000_0800 - 0x0000_ffff
 * - 4 bytes: 10xxxxxx 10xxxxxx 10xxxxxx 11110xxx - 0x0001_0000 - 0x001f_ffff
 *
 * This number is useful when emitting code points to a byte stream:
 *
 * Example:
 * ```ts
 * for (const letter of text) {
 *   const codePoint = letter.codePointAt(0) || 0;
 *   for (let utf8_32Rev = encodeToUtf8_32Rev(codePoint); utf8_32Rev !== 0; utf8_32Rev >>>= 8) {
 *      const byte = utf8_32Rev & 0xff;
 *      emit(byte); // write byte to stream
 *   }
 * }
 * ```
 */
export type Utf8_32Rev = number;

export type CodePoint = number;

/**
 * Encode a CodePoint into a Big Endian utf8 value, up to 4 bytes.
 * These numbers sort into the correct order for utf8.
 *
 *            hightest byte           lowest byte   Code Point Range
 * - 1 byte:  00000000 00000000 00000000 0xxxxxxx - 0x0000_0000 - 0x0000_007f
 * - 2 bytes: 00000000 00000000 110xxxxx 10xxxxxx - 0x0000_0080 - 0x0000_07ff
 * - 3 bytes: 00000000 1110xxxx 10xxxxxx 10xxxxxx - 0x0000_0800 - 0x0000_ffff
 * - 4 bytes: 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx - 0x0001_0000 - 0x001f_ffff
 *
 * @param code - the code point to encode
 * @returns number containing the utf8 value.
 */
export function encodeToUtf8_32(code: CodePoint): Utf8_32 {
    if (code < 0x80) {
        return code;
    }
    if (code < 0x800) {
        return 0xc080 | ((code & 0x7c0) << 2) | (code & 0x3f);
    }
    if (code < 0x1_0000) {
        return 0xe0_8080 | ((code & 0xf000) << 4) | ((code & 0x0fc0) << 2) | (code & 0x3f);
    }
    return (
        0xf080_8080 + (((code & 0x1c_0000) << 6) | ((code & 0x03_f000) << 4) | ((code & 0x0fc0) << 2) | (code & 0x3f))
    );
}

export function decodeUtf8_32(utf8: Utf8_32): CodePoint {
    if (utf8 >= 0 && utf8 < 0x80) {
        return utf8;
    }
    if ((utf8 & 0xffff_e080) === 0xc080) {
        return ((utf8 >>> 2) & 0x7c0) | (utf8 & 0x3f);
    }
    if ((utf8 & 0xfff0_8080) === 0xe0_8080) {
        return ((utf8 >>> 4) & 0xf000) | ((utf8 >>> 2) & 0x0fc0) | (utf8 & 0x3f);
    }
    if (((utf8 & 0xf880_8080) ^ 0xf080_8080) === 0) {
        return ((utf8 >>> 6) & 0x1c_0000) | ((utf8 >>> 4) & 0x03_f000) | ((utf8 >>> 2) & 0x0fc0) | (utf8 & 0x3f);
    }
    return 0xfffd;
}

export function* decodeUtf8_32_Stream(utf8s: Iterable<Utf8_32>): Iterable<CodePoint> {
    for (const utf8 of utf8s) {
        yield decodeUtf8_32(utf8);
    }
}

export function decodeUtf8_32_StreamToString(utf8s: Iterable<Utf8_32>): string {
    return String.fromCodePoint(...decodeUtf8_32_Stream(utf8s));
}

/**
 * Encode a CodePoint into a Little Endian utf8 value, up to 4 bytes.
 *
 * These numbers DO NOT sort into the correct order for utf8.
 *
 *            hightest byte           lowest byte   Code Point Range
 * - 1 byte:  00000000 00000000 00000000 0xxxxxxx - 0x0000_0000 - 0x0000_007f
 * - 2 bytes: 00000000 00000000 10xxxxxx 110xxxxx - 0x0000_0080 - 0x0000_07ff
 * - 3 bytes: 00000000 10xxxxxx 10xxxxxx 1110xxxx - 0x0000_0800 - 0x0000_ffff
 * - 4 bytes: 10xxxxxx 10xxxxxx 10xxxxxx 11110xxx - 0x0001_0000 - 0x001f_ffff
 *
 * @param code - the code point to encode
 * @returns number containing the utf8 value.
 */
export function encodeToUtf8_32Rev(code: CodePoint): Utf8_32Rev {
    if (code < 0x80) {
        return code;
    }
    if (code < 0x800) {
        return 0x80c0 | ((code & 0x7c0) >> 6) | ((code & 0x3f) << 8);
    }
    if (code < 0x1_0000) {
        return 0x80_80e0 | ((code & 0xf000) >>> 12) | ((code & 0xfc0) << 2) | ((code & 0x3f) << 16);
    }
    return (
        0x8080_80f0 +
        (((code & 0x1c_0000) >>> 18) | ((code & 0x03_f000) >>> 4) | ((code & 0xfc0) << 10) | ((code & 0x3f) << 24))
    );
}

export function decodeUtf8_32Rev(utf8: Utf8_32Rev): CodePoint {
    if (utf8 < 0) utf8 = 0x1_0000_0000 + utf8;

    if (utf8 < 0x80) {
        return utf8;
    }
    if ((utf8 & 0xffff_80e0) === 0x80c0) {
        return ((utf8 << 6) & 0x7c0) | ((utf8 >> 8) & 0x3f);
    }
    if ((utf8 & 0xff80_80f0) === 0x80_80e0) {
        return ((utf8 << 12) & 0xf000) | ((utf8 >>> 2) & 0xfc0) | ((utf8 >>> 16) & 0x3f);
    }
    if (((utf8 & 0x8080_80f8) ^ 0x8080_80f0) === 0) {
        return (
            ((utf8 << 18) & 0x1c_0000) | ((utf8 << 4) & 0x03_f000) | ((utf8 >>> 10) & 0xfc0) | ((utf8 >>> 24) & 0x3f)
        );
    }
    return 0xfffd;
}

export class Utf8Accumulator {
    remaining = 0;
    value = 0;
    decode(byte: number): CodePoint | undefined {
        let remaining = this.remaining;
        if (byte & ~0xff) return this.reset();
        if ((byte & 0x80) === 0) {
            if (remaining) return this.reset();
            return byte;
        }
        if (remaining) {
            if ((byte & 0xc0) !== 0x80) return this.reset();
            let value = this.value;
            value = (value << 6) | (byte & 0x3f);
            this.value = value;
            remaining -= 1;
            this.remaining = remaining;
            return remaining ? undefined : value;
        }
        if ((byte & 0xe0) === 0xc0) {
            this.value = byte & 0x1f;
            this.remaining = 1;
            return undefined;
        }
        if ((byte & 0xf0) === 0xe0) {
            this.value = byte & 0x0f;
            this.remaining = 2;
            return undefined;
        }
        if ((byte & 0xf8) === 0xf0) {
            this.value = byte & 0x07;
            this.remaining = 3;
            return undefined;
        }
        return this.reset();
    }

    reset() {
        this.remaining = 0;
        this.value = 0;
        return 0xfffd;
    }

    clone(into: Utf8Accumulator = new Utf8Accumulator()): Utf8Accumulator {
        into.remaining = this.remaining;
        into.value = this.value;
        return into;
    }

    static isMultiByte(v: number): boolean {
        return (v & 0x80) !== 0;
    }

    static isSingleByte(v: number): boolean {
        return (v & 0x80) === 0;
    }

    static create(): Utf8Accumulator {
        return new this();
    }
}

export function decodeUtf8ByteStream(
    bytes: Iterable<number> | ReadonlyArray<number> | Uint8Array,
): Iterable<CodePoint> {
    if (Array.isArray(bytes) || bytes instanceof Uint8Array) {
        return decodeUtf8ByteArray(bytes);
    }
    return _decodeUtf8ByteStream(bytes);
}

export function decodeUtf8ByteArray(bytes: ReadonlyArray<number> | Uint8Array): CodePoint[] {
    const values = new Array<CodePoint>(bytes.length);
    const acc = new Utf8Accumulator();
    let i = 0;
    for (const byte of bytes) {
        const code = acc.decode(byte);
        if (code !== undefined) {
            values[i++] = code;
        }
    }
    return values.slice(0, i);
}

function* _decodeUtf8ByteStream(bytes: Iterable<number>): Iterable<CodePoint> {
    const acc = new Utf8Accumulator();
    for (const byte of bytes) {
        const code = acc.decode(byte);
        if (code !== undefined) {
            yield code;
        }
    }
}

export function encodeUtf8into(code: CodePoint, into: Array<number> | Uint8Array, offset = 0): number {
    if (code < 0x80) {
        into[offset] = code;
        return 1;
    }
    if (code < 0x800) {
        const u = 0xc080 | ((code & 0x7c0) << 2) | (code & 0x3f);
        into[offset] = u >>> 8;
        into[offset + 1] = u & 0xff;
        return 2;
    }
    if (code < 0x1_0000) {
        const u = 0xe0_8080 | ((code & 0xf000) << 4) | ((code & 0x0fc0) << 2) | (code & 0x3f);
        into[offset] = u >>> 16;
        into[offset + 1] = (u >>> 8) & 0xff;
        into[offset + 2] = u & 0xff;
        return 3;
    }
    const u =
        0xf080_8080 | (((code & 0x1c_0000) << 6) | ((code & 0x03_f000) << 4) | ((code & 0x0fc0) << 2) | (code & 0x3f));
    into[offset] = (u >>> 24) & 0x0ff;
    into[offset + 1] = (u >>> 16) & 0xff;
    into[offset + 2] = (u >>> 8) & 0xff;
    into[offset + 3] = u & 0xff;
    return 4;
}

export function encodeTextToUtf8_32Into(text: string, into: Utf8_32[]): number {
    const len = text.length;
    let i = 0;
    for (let p = { text, offset: 0, bytes: 0 }; p.offset < len; ) {
        into[i++] = encodeTextToUtf8_32(p);
    }
    return i;
}

export interface TextOffset {
    text: string;
    offset: number;
}

export interface TextOffsetWithByteCount extends TextOffset {
    bytes?: number;
}

export function encodeTextToUtf8_32(offset: TextOffsetWithByteCount): Utf8_32 {
    const text = offset.text;
    let code = text.charCodeAt(offset.offset);
    code = (code & 0xf800) === 0xd800 ? text.codePointAt(offset.offset++) || 0 : code;
    offset.offset++;
    if (code < 0x80) {
        offset.bytes = 1;
        return code;
    }
    if (code < 0x800) {
        offset.bytes = 2;
        return 0xc080 | ((code & 0x7c0) << 2) | (code & 0x3f);
    }
    if (code < 0x1_0000) {
        offset.bytes = 3;
        return 0xe0_8080 | ((code & 0xf000) << 4) | ((code & 0x0fc0) << 2) | (code & 0x3f);
    }
    offset.bytes = 4;
    return (
        0x1_0000_0000 +
        (0xf080_8080 | (((code & 0x1c_0000) << 6) | ((code & 0x03_f000) << 4) | ((code & 0x0fc0) << 2) | (code & 0x3f)))
    );
}

export function encodeTextToUtf8_32Rev(offset: TextOffset): Utf8_32Rev {
    const text = offset.text;
    let code = text.charCodeAt(offset.offset);
    code = (code & 0xf800) === 0xd800 ? text.codePointAt(offset.offset++) || 0 : code;
    offset.offset++;

    if (code < 0x80) {
        return code;
    }
    if (code < 0x800) {
        return 0x80c0 | ((code & 0x7c0) >> 6) | ((code & 0x3f) << 8);
    }
    if (code < 0x1_0000) {
        return 0x80_80e0 | ((code & 0xf000) >>> 12) | ((code & 0xfc0) << 2) | ((code & 0x3f) << 16);
    }
    return (
        0x8080_80f0 +
        (((code & 0x1c_0000) >>> 18) | ((code & 0x03_f000) >>> 4) | ((code & 0xfc0) << 10) | ((code & 0x3f) << 24))
    );
}

export function encodeTextToUtf8Into(text: string, into: Array<number> | Uint8Array, offset = 0): number {
    const t = { text, offset: 0 };

    let i = offset;

    for (; t.offset < text.length; ) {
        const code = encodeTextToUtf8_32Rev(t);
        for (let utf8_32Rev = code; utf8_32Rev !== 0; utf8_32Rev >>>= 8) {
            into[i++] = utf8_32Rev & 0xff;
        }
    }
    return i - offset;
}

export function encodeTextToUtf8(text: string): number[] {
    const into: number[] = new Array(text.length);

    encodeTextToUtf8Into(text, into);

    return into;
}

export function textToCodePoints(text: string): CodePoint[] {
    const codePoints: CodePoint[] = new Array(text.length);
    const len = text.length;
    let j = 0;
    for (let i = 0; i < len; i++) {
        const code = text.charCodeAt(i);
        codePoints[j++] = (code & 0xf800) === 0xd800 ? text.codePointAt(i++) || 0 : code;
    }
    codePoints.length = j;
    return codePoints;
}

export function encodeCodePointsToUtf8Into(data: CodePoint[], into: Array<number> | Uint8Array, offset = 0): number {
    let i = offset;
    for (const code of data) {
        i += encodeUtf8into(code, into, i);
    }
    return i - offset;
}

export function hex32(n: number): string {
    if (n < 0) n = 0x1_0000_0000 + n;
    const s = '0x' + n.toString(16).padStart(8, '0');
    return s.slice(0, 6) + '_' + s.slice(6);
}

// cspell:ignoreRegExp /0x[0-9a-f_]+/g
