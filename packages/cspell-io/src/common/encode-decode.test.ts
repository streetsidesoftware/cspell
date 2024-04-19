/* eslint-disable unicorn/text-encoding-identifier-case */
import { describe, expect, test } from 'vitest';

import { arrayBufferViewToBuffer, swap16 as swapBytesInPlace, swapBytes } from './arrayBuffers.js';
import { decode, decodeToString, encodeString } from './encode-decode.js';

const samples = ['This is a bit of text'];

const sampleText = 'a Ā 𐀀 文 🦄';
const sampleText2 = [...sampleText].reverse().join('');

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
        text          | encoding      | bom
        ${'hello'}    | ${'utf8'}     | ${undefined}
        ${samples[0]} | ${'utf8'}     | ${undefined}
        ${samples[0]} | ${'utf16le'}  | ${undefined}
        ${samples[0]} | ${'utf-16be'} | ${undefined}
        ${samples[0]} | ${'utf8'}     | ${false}
        ${samples[0]} | ${'utf16le'}  | ${false}
        ${samples[0]} | ${'utf-16be'} | ${false}
        ${samples[0]} | ${'utf8'}     | ${true}
        ${samples[0]} | ${'utf16le'}  | ${true}
        ${samples[0]} | ${'utf-16be'} | ${true}
        ${'hello'}    | ${undefined}  | ${undefined}
        ${'h'}        | ${undefined}  | ${undefined}
        ${''}         | ${undefined}  | ${undefined}
        ${sampleText} | ${undefined}  | ${undefined}
    `('encode/decode $encoding $bom $text', ({ text, encoding }) => {
        const encoded = encodeString(text, encoding);
        expect(decode(encoded, encoding)).toBe(text);
        expect(decode(encoded)).toBe(text);
    });

    test.each`
        data          | encoding       | expected
        ${sampleText} | ${undefined}   | ${sampleText}
        ${sampleText} | ${'hex'}       | ${'6120c48020f090808020e6968720f09fa684'}
        ${sampleText} | ${'base64'}    | ${'YSDEgCDwkICAIOaWhyDwn6aE' /* cspell:cspell:disable-line */}
        ${sampleText} | ${'base64url'} | ${'YSDEgCDwkICAIOaWhyDwn6aE' /* cspell:cspell:disable-line */}
    `('decode $data $encoding', ({ data, encoding, expected }) => {
        const result = decode(ab(data), encoding);
        expect(result).toEqual(expected);
    });

    test.each`
        text           | encoding      | textEncoding  | bom
        ${'hello'}     | ${'utf8'}     | ${undefined}  | ${true}
        ${'hello'}     | ${'utf8'}     | ${'utf-8'}    | ${true}
        ${sampleText}  | ${'utf-16be'} | ${undefined}  | ${true}
        ${sampleText}  | ${'utf16be'}  | ${undefined}  | ${true}
        ${sampleText}  | ${'utf16le'}  | ${undefined}  | ${true}
        ${'hello'}     | ${'utf-16le'} | ${undefined}  | ${false}
        ${'hello'}     | ${'utf-16be'} | ${undefined}  | ${false}
        ${'hello'}     | ${'utf-16le'} | ${'utf8'}     | ${true}
        ${'hello'}     | ${'utf-16le'} | ${'utf8'}     | ${false}
        ${sampleText2} | ${'utf-16le'} | ${'utf8'}     | ${true}
        ${sampleText2} | ${'utf-16le'} | ${'utf-16le'} | ${false}
        ${sampleText2} | ${'utf-16be'} | ${'utf-16be'} | ${false}
    `(
        'decodeToString mismatch $text $encoding -> $textEncoding with BOM $bom',
        ({ text, encoding, textEncoding, bom }) => {
            const buf = encodeString(text, encoding, bom);
            const result = decodeToString(buf, textEncoding);
            expect(result).toEqual(text);
        },
    );

    test.each`
        text       | encoding  | textEncoding  | bom
        ${'hello'} | ${'utf8'} | ${'utf-32le'} | ${true}
    `(
        'decodeToString error $text $encoding -> $textEncoding with BOM $bom',
        ({ text, encoding, textEncoding, bom }) => {
            const buf = encodeString(text, encoding, bom);
            expect(() => decodeToString(buf, textEncoding)).toThrowError('Unsupported encoding: utf-32le');
        },
    );
});

function ab(data: string | Buffer | ArrayBufferView, encoding?: BufferEncoding): ArrayBufferView {
    return typeof data === 'string'
        ? Buffer.from(data, encoding)
        : data instanceof Buffer
          ? Buffer.from(data)
          : Buffer.from(arrayBufferViewToBuffer(data));
}
