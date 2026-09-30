import { Buffer } from 'node:buffer';

import type { TArrayBufferView } from '../types.js';

export function arrayBufferViewToBuffer(data: TArrayBufferView): Buffer<ArrayBuffer>;
export function arrayBufferViewToBuffer(data: ArrayBufferView): Buffer;
export function arrayBufferViewToBuffer(data: ArrayBufferView): Buffer {
    if (data instanceof Buffer) {
        return data;
    }
    const buf = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    return buf;
}
