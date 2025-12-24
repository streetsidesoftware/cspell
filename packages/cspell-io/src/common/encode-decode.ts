/* eslint-disable n/no-unsupported-features/node-builtins */
/* eslint-disable unicorn/text-encoding-identifier-case */
import { Buffer } from 'node:buffer';
import { gunzipSync } from 'node:zlib';

import type { TArrayBufferView } from '../types.js';
import { arrayBufferViewToBuffer, swap16, swapBytes, toUint8Array } from './arrayBuffers.js';
import type { BufferEncodingExt, TextEncodingExt } from './BufferEncoding.js';

const BOM_BE = 0xfeff;
const BOM_LE = 0xfffe;

const decoderUTF8 = new TextDecoder('utf8');
const decoderUTF16LE = new TextDecoder('utf-16le');
const decoderUTF16BE = createTextDecoderUtf16BE();

const encoderUTF8 = new TextEncoder();
// const encoderUTF16LE = new TextEncoder('utf-16le');

export type TypedArrayView = TArrayBufferView<ArrayBuffer>;

export function decodeUtf16LE(data: TypedArrayView): string {
    const buf = toUint8Array(data);
    const bom = (buf[0] << 8) | buf[1];
    return decoderUTF16LE.decode(bom === BOM_LE ? buf.subarray(2) : buf);
}

export function decodeUtf16BE(data: TypedArrayView): string {
    const buf = toUint8Array(data);
    const bom = (buf[0] << 8) | buf[1];
    return decoderUTF16BE.decode(bom === BOM_BE ? buf.subarray(2) : buf);
}

export function decodeToString(data: TypedArrayView, encoding?: TextEncodingExt): string {
    if (isGZipped(data)) {
        return decodeToString(decompressBuffer(data), encoding);
    }
    const buf = toUint8Array(data);
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

export function decode(data: TArrayBufferView, encoding?: BufferEncodingExt): string {
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

export function encodeString(str: string, encoding?: BufferEncodingExt, bom?: boolean): Uint8Array<ArrayBuffer> {
    switch (encoding) {
        case undefined:
        case 'utf-8':
        case 'utf8': {
            return encoderUTF8.encode(str);
        }
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

export function encodeUtf16LE(str: string, bom = true): Uint8Array<ArrayBuffer> {
    const buf = Buffer.from(str, 'utf16le');

    if (bom) {
        const target = Buffer.alloc(buf.length + 2);
        target.writeUint16LE(BOM_BE);
        buf.copy(target, 2);
        return target;
    }
    return buf;
}

export function encodeUtf16BE(str: string, bom = true): Uint8Array<ArrayBuffer> {
    return swap16(encodeUtf16LE(str, bom));
}

export function calcEncodingFromBom(data: TArrayBufferView): 'utf16be' | 'utf16le' | undefined {
    const buf = toUint8Array(data);
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
            decode: (input: TArrayBufferView) => decoderUTF16LE.decode(swapBytes(input)),
        };
    }
}

export class UnsupportedEncodingError extends Error {
    constructor(encoding: string) {
        super(`Unsupported encoding: ${encoding}`);
    }
}

export function isGZipped(data: TypedArrayView | string): boolean {
    if (typeof data === 'string') return false;
    const buf = toUint8Array(data);
    return buf[0] === 0x1f && buf[1] === 0x8b;
}

function decompressBuffer(data: TypedArrayView): TypedArrayView {
    if (!isGZipped(data)) return data;
    const buf = arrayBufferViewToBuffer(data);
    return gunzipSync(buf);
}

export async function decompress(
    data: TypedArrayView,
    method: CompressionFormat = 'gzip',
): Promise<Uint8Array<ArrayBuffer>> {
    const ds = new DecompressionStream(method || 'deflate-raw');

    const writer = ds.writable.getWriter();
    writer.write(data);
    writer.close();

    const reader = ds.readable.getReader();

    const chunks: Uint8Array[] = [];
    let size = 0;

    while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        chunks.push(chunk.value);
        size += chunk.value.length;
    }

    const result = new Uint8Array(size);
    for (let offset = 0, i = 0; i < chunks.length; i++) {
        result.set(chunks[i], offset);
        offset += chunks[i].length;
    }

    return result;
}
