import { describe, expect, test } from 'vitest';

import {
    __debug__,
    arrayBufferViewToBuffer,
    asUint8Array,
    copyArrayBufferView,
    sliceView,
    swap16,
} from './arrayBuffers.js';

const sampleText = 'This is a bit of text to test things with.';

describe('arrayBuffers', () => {
    test('asUint8Array', () => {
        const buf = Buffer.from(sampleText);
        const u8 = asUint8Array(buf);
        expect(u8[0]).toBe(sampleText.charCodeAt(0));
        expect(buf[0]).toBe(sampleText.charCodeAt(0));
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
        const sBuf = __debug__.swap16Poly(buf);
        expect(sBuf).toBe(buf);
        expect(buf).not.toEqual(Buffer.from(src));
        expect(buf).toEqual(Buffer.from([2, 1, 4, 3]));
    });

    test('sliceView', () => {
        const src = [1, 2, 3, 4, 5, 6, 7, 8];
        const buf = Buffer.from(src);
        const view = sliceView(buf, 2, 4);
        expect(view.buffer).toBe(buf.buffer);
        const u8 = asUint8Array(view);
        expect(u8.buffer).toBe(buf.buffer);
        const u8From = Uint8Array.from(src);
        const cView = copyArrayBufferView(view);
        expect(cView.buffer).not.toBe(buf.buffer);
        expect(cView).toEqual(Uint8Array.from([3, 4, 5, 6]));
        expect(u8).toEqual(Uint8Array.from([3, 4, 5, 6]));
        expect(asUint8Array(sliceView(u8From, 2, 4))).toEqual(Uint8Array.from([3, 4, 5, 6]));
    });

    test('sliceView bounds', () => {
        const src = [1, 2, 3, 4, 5, 6, 7, 8];
        const buf = Uint8Array.from(src);
        const view = sliceView(buf, 2, 100);
        expect(view.buffer).toBe(buf.buffer);
        expect(asUint8Array(view)).toEqual(Uint8Array.from([3, 4, 5, 6, 7, 8]));
        const view2 = sliceView(view, 2);
        expect(view2.buffer).toBe(buf.buffer);
        expect(asUint8Array(view2)).toEqual(Uint8Array.from([5, 6, 7, 8]));
    });

    test('arrayBufferViewToBuffer', () => {
        const src = [1, 2, 3, 4, 5, 6, 7, 8];
        const buf = Buffer.from(src);
        expect(arrayBufferViewToBuffer(buf)).toBe(buf);

        const view = sliceView(buf, 2, 4);
        const bufView = arrayBufferViewToBuffer(view);
        expect(bufView).not.toBe(buf);
        expect(bufView.buffer).toBe(buf.buffer);
        expect(bufView).toEqual(Buffer.from([3, 4, 5, 6]));
    });
});
