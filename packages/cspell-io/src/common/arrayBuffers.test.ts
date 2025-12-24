import { Buffer } from 'node:buffer';

import { describe, expect, test } from 'vitest';

import { arrayBufferViewToBuffer, swap16, swap16Poly, toUint8Array } from './arrayBuffers.js';

const sampleText = 'This is a bit of text to test things with.';

describe('arrayBuffers', () => {
    test('asUint8Array', () => {
        const buf = Buffer.from(sampleText);
        const u8 = toUint8Array(buf);
        expect(u8[0]).toBe(sampleText.codePointAt(0));
        expect(buf[0]).toBe(sampleText.codePointAt(0));
        u8[0] = 32;
        expect(u8[0]).toBe(32);
        expect(u8[0]).toBe(buf[0]);
    });

    test('swap', () => {
        const src = [1, 2, 3, 4];
        const buf = Buffer.from(src);
        expect(buf).toEqual(Buffer.from(src));
        const sBuf = swap16(buf);
        expect(sBuf).toBe(buf);
        expect(buf).not.toEqual(Buffer.from(src));
        expect(buf).toEqual(Buffer.from([2, 1, 4, 3]));
    });

    test('swapPoly', () => {
        const src = [1, 2, 3, 4];
        const buf = Buffer.from(src);
        expect(buf).toEqual(Buffer.from(src));
        const sBuf = swap16Poly(buf);
        expect(sBuf).toBe(buf);
        expect(buf).not.toEqual(Buffer.from(src));
        expect(buf).toEqual(Buffer.from([2, 1, 4, 3]));
    });

    test('arrayBufferViewToBuffer', () => {
        const src = [1, 2, 3, 4, 5, 6, 7, 8];
        const buf = Buffer.from(src);
        expect(arrayBufferViewToBuffer(buf)).toBe(buf);

        const view = buf.subarray(2, 6);
        const bufView = arrayBufferViewToBuffer(view);
        expect(bufView).not.toBe(buf);
        expect(bufView.buffer).toBe(buf.buffer);
        expect(bufView).toEqual(Buffer.from([3, 4, 5, 6]));
    });
});
