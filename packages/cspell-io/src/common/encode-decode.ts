/* eslint-disable unicorn/text-encoding-identifier-case */
import { gunzipSync } from 'node:zlib';

import { arrayBufferViewToBuffer, asUint8Array, swap16, swapBytes } from './arrayBuffers.js';
import type { BufferEncodingExt, TextEncodingExt } from './BufferEncoding.js';

const BOM_BE = 0xfeff;
const BOM_LE = 0xfffe;

const decoderUTF8 = new TextDecoder('utf8');
const decoderUTF16LE = new TextDecoder('utf-16le');
const decoderUTF16BE = createTextDecoderUtf16BE();

// const encoderUTF8 = new TextEncoder();
// const encoderUTF16LE = new TextEncoder('utf-16le');

export function decodeUtf16LE(data: ArrayBufferView): string {
    const buf = asUint8Array(data);
    const bom = (buf[0] << 8) | buf[1];
    return decoderUTF16LE.decode(bom === BOM_LE ? buf.subarray(2) : buf);
}

export function decodeUtf16BE(data: ArrayBufferView): string {
    const buf = asUint8Array(data);
    const bom = (buf[0] << 8) | buf[1];
    return decoderUTF16BE.decode(bom === BOM_BE ? buf.subarray(2) : buf);
}

export function decodeToString(data: ArrayBufferView, encoding?: TextEncodingExt): string {
    if (isGZipped(data)) {
        return decodeToString(decompressBuffer(data), encoding);
    }
    const buf = asUint8Array(data);
    const bom = (buf[0] << 8) | buf[1];
    if (bom === BOM_BE || (buf[0] === 0 && buf[1] !== 0)) return decodeUtf16BE(buf);
    if (bom === BOM_LE || (buf[0] !== 0 && buf[1] === 0)) return decodeUtf16LE(buf);

    if (!encoding) return decoderUTF8.decode(buf);

    switch (encoding) {
        case 'utf-16be':
        case 'utf16be': {
            return decodeUtf16BE(buf);
        }
        case 'utf-16le':
        case 'utf16le': {
            return decodeUtf16LE(buf);
        }
        case 'utf-8':
        case 'utf8': {
            return decoderUTF8.decode(buf);
        }
    }

    throw new UnsupportedEncodingError(encoding);
}

export function decode(data: ArrayBufferView, encoding?: BufferEncodingExt): string {
    switch (encoding) {
        case 'base64':
        case 'base64url':
        case 'hex': {
            return arrayBufferViewToBuffer(data).toString(encoding);
        }
    }

    const result = decodeToString(data, encoding);
    // console.log('decode %o', { data, encoding, result });
    return result;
}

export function encodeString(str: string, encoding?: BufferEncodingExt, bom?: boolean): ArrayBufferView {
    switch (encoding) {
        case 'utf-16be':
        case 'utf16be': {
            return encodeUtf16BE(str, bom);
        }
        case 'utf-16le':
        case 'utf16le': {
            return encodeUtf16LE(str, bom);
        }
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
    return swap16(encodeUtf16LE(str, bom));
}

export function calcEncodingFromBom(data: ArrayBufferView): 'utf16be' | 'utf16le' | undefined {
    const buf = asUint8Array(data);
    if (buf.length < 2) return undefined;
    switch ((buf[0] << 8) | buf[1]) {
        case BOM_BE: {
            return 'utf16be';
        }
        case BOM_LE: {
            return 'utf16le';
        }
    }
    return undefined;
}

function createTextDecoderUtf16BE() {
    try {
        const decoder = new TextDecoder('utf-16be');
        return decoder;
    } catch {
        return {
            encoding: 'utf-16be',
            fatal: false,
            ignoreBOM: false,
            decode: (input: ArrayBufferView) => decoderUTF16LE.decode(swapBytes(input)),
        };
    }
}

export class UnsupportedEncodingError extends Error {
    constructor(encoding: string) {
        super(`Unsupported encoding: ${encoding}`);
    }
}

export function isGZipped(data: ArrayBufferView | string): boolean {
    if (typeof data === 'string') return false;
    const buf = asUint8Array(data);
    return buf[0] === 0x1f && buf[1] === 0x8b;
}

function decompressBuffer(data: ArrayBufferView): ArrayBufferView {
    if (!isGZipped(data)) return data;
    const buf = arrayBufferViewToBuffer(data);
    return gunzipSync(buf);
}
