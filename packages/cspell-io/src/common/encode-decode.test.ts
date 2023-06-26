import { describe, expect, test } from 'vitest';

import { arrayBufferViewToBuffer } from './arrayBuffers.js';
import { decode, encodeString, swapBytes, swapBytesInPlace } from './encode-decode.js';

const samples = ['This is a bit of text'];

describe('encode-decode', () => {
    test.each`
        text          | encoding     | expected
        ${'hello'}    | ${'utf8'}    | ${ab('hello')}
        ${samples[0]} | ${'utf8'}    | ${ab(samples[0])}
        ${samples[0]} | ${'utf16le'} | ${ab(samples[0], 'utf16le')}
    `('encodeString $encoding $text', ({ text, encoding, expected }) => {
        expect(encodeString(text, encoding, false)).toEqual(expected);
    });

    test.each`
        encoding
        ${'utf16le'}
    `('swapBytesInPlace $encoding', ({ encoding }) => {
        const src = ab('The sun is shining.', encoding);
        const buf = ab(src);
        expect(buf).toEqual(src);
        swapBytesInPlace(buf);
        expect(buf).not.toEqual(src);
        swapBytesInPlace(buf);
        expect(buf).toEqual(src);
    });

    test.each`
        text
        ${'apple'}
        ${'123'}
        ${'1234'}
    `('swapBytes $encoding', ({ text }) => {
        const src = ab(text, 'utf16le');
        const buf = ab(src);
        expect(buf).toEqual(src);
        const buf2 = swapBytes(buf);
        expect(buf).toEqual(src);
        expect(buf2).not.toEqual(src);
        const buf3 = swapBytes(buf2);
        expect(buf3).toEqual(src);
    });

    test.each`
        text          | encoding     | bom
        ${'hello'}    | ${'utf8'}    | ${undefined}
        ${samples[0]} | ${'utf8'}    | ${undefined}
        ${samples[0]} | ${'utf16le'} | ${undefined}
        ${samples[0]} | ${'utf16be'} | ${undefined}
        ${samples[0]} | ${'utf8'}    | ${false}
        ${samples[0]} | ${'utf16le'} | ${false}
        ${samples[0]} | ${'utf16be'} | ${false}
        ${samples[0]} | ${'utf8'}    | ${true}
        ${samples[0]} | ${'utf16le'} | ${true}
        ${samples[0]} | ${'utf16be'} | ${true}
        ${'hello'}    | ${undefined} | ${undefined}
        ${'h'}        | ${undefined} | ${undefined}
        ${''}         | ${undefined} | ${undefined}
    `('encode/decode $encoding $bom $text', ({ text, encoding }) => {
        const encoded = encodeString(text, encoding);
        expect(decode(encoded, encoding)).toBe(text);
        expect(decode(encoded)).toBe(text);
    });
});

function ab(data: string | Buffer | ArrayBufferView, encoding?: BufferEncoding): ArrayBufferView {
    return typeof data === 'string'
        ? Buffer.from(data, encoding)
        : data instanceof Buffer
        ? Buffer.from(data)
        : Buffer.from(arrayBufferViewToBuffer(data));
}
