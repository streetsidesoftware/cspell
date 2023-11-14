/**
 * Treat a ArrayBufferView as a Uint8Array.
 * The Uint8Array will share the same underlying ArrayBuffer.
 * @param data - source data
 * @returns Uint8Array
 */
export function asUint8Array(data: ArrayBufferView): Uint8Array {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
}

export function arrayBufferViewToBuffer(data: ArrayBufferView): Buffer {
    if (data instanceof Buffer) {
        return data;
    }
    const buf = Buffer.from(data.buffer);
    if (data.byteOffset === 0 && data.byteLength === data.buffer.byteLength) {
        return buf;
    }
    return buf.subarray(data.byteOffset, data.byteOffset + data.byteLength);
}

/**
 * Copy the data buffer.
 * @param data - source data
 * @returns A copy of the data
 */
export function copyArrayBufferView(data: ArrayBufferView): ArrayBufferView {
    return new Uint8Array(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
}

/**
 * Slice an existing data view. Returns a new view using the same underlying data.
 * @param data - data view
 * @param byteOffset - offset from the beginning of the view.
 * @param byteLength - optional length
 */
export function sliceView(data: ArrayBufferView, byteOffset: number, byteLength?: number): ArrayBufferView {
    const currentEnd = data.byteOffset + data.byteLength;
    const start = Math.min(data.byteOffset + byteOffset, currentEnd);
    const end = byteLength ? Math.min(currentEnd, start + byteLength) : currentEnd;
    return {
        buffer: data.buffer,
        byteOffset: start,
        byteLength: end - start,
    };
}

/**
 * Swap the bytes in a buffer.
 * @param data - data to swap
 * @returns data
 */
function swap16Poly(data: ArrayBufferView): ArrayBufferView {
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
export function swap16(data: ArrayBufferView): ArrayBufferView {
    if (typeof Buffer !== 'undefined') {
        return arrayBufferViewToBuffer(data).swap16();
    }
    return swap16Poly(data);
}

export function swapBytes(data: ArrayBufferView): ArrayBufferView {
    const buf = copyArrayBufferView(data);
    return swap16(buf);
}

export const __debug__ = {
    swap16Poly,
};
