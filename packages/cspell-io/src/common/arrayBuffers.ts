export function toUint8Array(data: ArrayBufferView): Uint8Array {
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
