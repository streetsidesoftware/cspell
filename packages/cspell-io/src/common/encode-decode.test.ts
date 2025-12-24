/* eslint-disable unicorn/text-encoding-identifier-case */
import { Buffer } from 'node:buffer';
import { promisify } from 'node:util';
import zlib from 'node:zlib';

import { describe, expect, test } from 'vitest';

import { arrayBufferViewToBuffer, swap16 as swapBytesInPlace, swapBytes } from './arrayBuffers.js';
import { decode, decodeToString, decompress, encodeString } from './encode-decode.js';

const gzip = promisify(zlib.gzip);
const deflate = promisify(zlib.deflate);
const deflateRaw = promisify(zlib.deflateRaw);
// const gunzip = promisify(zlib.gunzip);
// const inflate = promisify(zlib.inflate);
// const inflateRaw = promisify(zlib.inflateRaw);

const samples = ['This is a bit of text'];

const sampleText = 'a Ā 𐀀 文 🦄';
const sampleText2 = [...sampleText].reverse().join('');
const encoderUTF8 = new TextEncoder();

describe('encode-decode', () => {
    test.each`
        text          | encoding     | expected
        ${'hello'}    | ${'utf8'}    | ${aBytes('hello')}
        ${samples[0]} | ${'utf8'}    | ${aBytes(samples[0])}
        ${samples[0]} | ${'utf16le'} | ${aBuffer(samples[0], 'utf16le')}
    `('encodeString $encoding $text', ({ text, encoding, expected }) => {
        expect(encodeString(text, encoding, false)).toEqual(expected);
    });

    test.each`
        encoding
        ${'utf16le'}
    `('swapBytesInPlace $encoding', ({ encoding }) => {
        const src = aBuffer('The sun is shining.', encoding);
        const buf = aBuffer(src);
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
        const src = aBuffer(text, 'utf16le');
        const buf = aBuffer(src);
        expect(buf).toEqual(src);
        const buf2 = swapBytes(buf);
        expect(buf).toEqual(src);
        expect(buf2).not.toEqual(src);
        const buf3 = swapBytes(buf2);
        expect([...buf3]).toEqual([...src]);
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
        const result = decode(aBuffer(data), encoding);
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

    test('gzip decompress', async () => {
        const encoder = new TextEncoder();
        const text = 'This is some text that will be compressed using gzip';
        const buf = encoder.encode(text);
        const gzipped = await gzip(buf);
        const unzipped = await decompress(gzipped);
        expect(unzipped).toEqual(buf);
    });

    test.each`
        method           | text
        ${'gzip'}        | ${'This is some text that will be compressed using gzip'}
        ${'deflate'}     | ${'This is some text that will be compressed using deflate'}
        ${'deflate'}     | ${'deflate - This is some text that will be compressed using deflate'}
        ${'deflate-raw'} | ${'This is some text that will be compressed using deflate'}
        ${'deflate-raw'} | ${'deflate - This is some text that will be compressed using deflate'}
    `('decompress $method', async ({ method, text }) => {
        const encoder = new TextEncoder();
        const buf = encoder.encode(text);
        const compressed = new Uint8Array(await _compress(buf, method));
        const result = await decompress(compressed, method);
        expect(result).toEqual(buf);
    });
});

function _compress(data: Uint8Array<ArrayBuffer>, method: CompressionFormat) {
    switch (method) {
        case 'gzip': {
            return gzip(data);
        }
        case 'deflate': {
            return deflate(data);
        }
        case 'deflate-raw': {
            return deflateRaw(data);
        }
    }
}

function aBuffer(
    data: string | Buffer<ArrayBuffer> | ArrayBufferView<ArrayBuffer>,
    encoding?: BufferEncoding,
): Buffer<ArrayBuffer> {
    if (typeof data === 'string') {
        return Buffer.from(data, encoding);
    }
    return data instanceof Buffer ? Buffer.from(data) : Buffer.from(arrayBufferViewToBuffer(data));
}

function aBytes(data: string | ArrayBufferView<ArrayBuffer>, encoding?: BufferEncoding): Uint8Array<ArrayBuffer>;
function aBytes(data: string | ArrayBufferView, encoding?: BufferEncoding): Uint8Array;

function aBytes(data: string | ArrayBufferView, encoding?: BufferEncoding): Uint8Array {
    if (typeof data === 'string') {
        if (!encoding || encoding === 'utf8' || encoding === 'utf-8') {
            return encoderUTF8.encode(data);
        }
        const view = Buffer.from(data, encoding);
        return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
    }
    return data instanceof Uint8Array ? data : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
}
