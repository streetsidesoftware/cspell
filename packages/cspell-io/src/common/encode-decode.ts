import { arrayBufferViewToBuffer, copyArrayBufferView, toUint8Array } from './arrayBuffers.js';
import type { BufferEncodingExt } from './BufferEncoding.js';

const BOM_BE = 0xfeff;
const BOM_LE = 0xfffe;

export function decodeUtf16LE(data: ArrayBufferView): string {
    let buf = arrayBufferViewToBuffer(data);
    const bom = (buf[0] << 8) | buf[1];
    buf = bom === BOM_LE ? buf.subarray(2) : buf;
    return buf.toString('utf16le');
}

export function decodeUtf16BE(buf: ArrayBufferView): string {
    return decodeUtf16LE(swapBytes(buf));
}

export function decode(data: ArrayBufferView, encoding?: BufferEncodingExt): string {
    const buf = arrayBufferViewToBuffer(data);
    switch (encoding) {
        case 'utf16be':
            return decodeUtf16BE(buf);
        case 'utf16le':
            return decodeUtf16LE(buf);
    }
    if (buf.length < 2 || (encoding && !encoding.startsWith('utf'))) return buf.toString(encoding);
    const bom = (buf[0] << 8) | buf[1];
    if (bom === BOM_BE || (buf[0] === 0 && buf[1] !== 0)) return decodeUtf16BE(buf);
    if (bom === BOM_LE || (buf[0] !== 0 && buf[1] === 0)) return decodeUtf16LE(buf);
    return buf.toString(encoding);
}

export function swapBytesInPlace(data: ArrayBufferView): ArrayBufferView {
    const buf = arrayBufferViewToBuffer(data);
    buf.swap16();
    return buf;
}

export function swapBytes(data: ArrayBufferView): ArrayBufferView {
    const buf = copyArrayBufferView(data);
    return swapBytesInPlace(buf);
}

export function encodeString(str: string, encoding?: BufferEncodingExt, bom?: boolean): ArrayBufferView {
    switch (encoding) {
        case 'utf16be':
            return encodeUtf16BE(str, bom);
        case 'utf16le':
            return encodeUtf16LE(str, bom);
    }
    return Buffer.from(str, encoding);
}

export function encodeUtf16LE(str: string, bom = true): ArrayBufferView {
    const buf = Buffer.from(str, 'utf16le');

    if (bom) {
        const target = Buffer.alloc(buf.length + 2);
        target.writeUint16LE(BOM_BE);
        buf.copy(target, 2);
        return target;
    }
    return buf;
}

export function encodeUtf16BE(str: string, bom = true): ArrayBufferView {
    return swapBytesInPlace(encodeUtf16LE(str, bom));
}

export function calcEncodingFromBom(data: ArrayBufferView): 'utf16be' | 'utf16le' | undefined {
    const buf = toUint8Array(data);
    if (buf.length < 2) return undefined;
    switch ((buf[0] << 8) | buf[1]) {
        case BOM_BE:
            return 'utf16be';
        case BOM_LE:
            return 'utf16le';
    }
    return undefined;
}
