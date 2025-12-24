import { Buffer } from 'node:buffer';

import type { TArrayBufferView } from '../types.js';

/**
 * Treat a TArrayBufferView as a Uint8Array.
 * The Uint8Array will share the same underlying ArrayBuffer.
 * @param data - source data
 * @returns Uint8Array
 */
export function toUint8Array(data: TArrayBufferView): Uint8Array<ArrayBuffer>;
export function toUint8Array(data: ArrayBufferView): Uint8Array;
export function toUint8Array(data: ArrayBufferView): Uint8Array {
    if (data instanceof Uint8Array) {
        return data;
    }
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
}

export function arrayBufferViewToBuffer(data: TArrayBufferView): Buffer<ArrayBuffer>;
export function arrayBufferViewToBuffer(data: ArrayBufferView): Buffer;
export function arrayBufferViewToBuffer(data: ArrayBufferView): Buffer {
    if (data instanceof Buffer) {
        return data;
    }
    const buf = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    return buf;
}

/**
 * Copy the data buffer.
 * @param data - source data
 * @returns A copy of the data
 */
export function copyArrayBufferView(data: TArrayBufferView): Uint8Array<ArrayBuffer>;
export function copyArrayBufferView(data: ArrayBufferView): Uint8Array;
export function copyArrayBufferView(data: ArrayBufferView): Uint8Array {
    return new Uint8Array(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
}

/**
 * Swap the bytes in a buffer.
 * @param data - data to swap
 * @returns data
 */
export function swap16Poly<T extends TArrayBufferView>(data: T): T;
export function swap16Poly<T extends ArrayBufferView>(data: T): T;
export function swap16Poly(data: TArrayBufferView): TArrayBufferView {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    for (let i = 0; i < view.byteLength; i += 2) {
        view.setUint16(i, view.getUint16(i, false), true);
    }
    return data;
}

/**
 * Swap the bytes in a buffer.
 * @param data - data to swap
 * @returns data
 */
export function swap16<T extends TArrayBufferView>(data: T): T;
export function swap16<T extends ArrayBufferView>(data: T): T;

export function swap16<T extends ArrayBufferView>(data: T): T {
    arrayBufferViewToBuffer(data).swap16();
    return data;
}

export function swapBytes(data: TArrayBufferView): Uint8Array<ArrayBuffer> {
    const buf = copyArrayBufferView(data);
    return swap16(buf);
}
