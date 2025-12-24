export function toUint8Array(data: Uint8Array<ArrayBuffer> | ArrayBufferView<ArrayBuffer>): Uint8Array<ArrayBuffer>;
export function toUint8Array(data: Uint8Array | ArrayBufferView): Uint8Array;

export function toUint8Array(data: Uint8Array | ArrayBufferView): Uint8Array {
    return data instanceof Uint8Array ? data : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
}
