import type { BufferEncodingExt } from './BufferEncoding';

const BOM_BE = 0xfeff;
const BOM_LE = 0xfffe;

export function decodeUtf16LE(buf: Buffer): string {
    const bom = (buf[0] << 8) | buf[1];
    buf = bom === BOM_LE ? buf.subarray(2) : buf;
    return buf.toString('utf16le');
}

export function decodeUtf16BE(buf: Buffer): string {
    return decodeUtf16LE(swapBytes(buf));
}

export function decodeUtf(buf: Buffer, encoding?: BufferEncodingExt): string {
    switch (encoding) {
        case 'utf16be':
            return decodeUtf16BE(buf);
        case 'utf16le':
            return decodeUtf16LE(buf);
        case 'utf8':
            return buf.toString('utf8');
    }
    if (buf.length < 2) return buf.toString('utf8');
    const bom = (buf[0] << 8) | buf[1];
    if (bom === BOM_BE || (buf[0] === 0 && buf[1] !== 0)) return decodeUtf16BE(buf);
    if (bom === BOM_LE || (buf[0] !== 0 && buf[1] === 0)) return decodeUtf16LE(buf);
    return buf.toString('utf8');
}

export function swapBytesInPlace(buf: Buffer): Buffer {
    for (let i = 0; i < buf.length - 1; i += 2) {
        const v = buf[i];
        buf[i] = buf[i + 1];
        buf[i + 1] = v;
    }
    return buf;
}

export function swapBytes(buf: Buffer): Buffer {
    const tBuf = Buffer.from(buf);
    return swapBytesInPlace(tBuf);
}

export function encodeString(str: string, encoding?: BufferEncodingExt, bom?: boolean): Buffer {
    switch (encoding) {
        case 'utf16be':
            return encodeUtf16BE(str, bom);
        case 'utf16le':
            return encodeUtf16LE(str, bom);
    }
    return Buffer.from(str, 'utf8');
}

export function encodeUtf16LE(str: string, bom = true) {
    const buf = Buffer.from(str, 'utf16le');

    if (bom) {
        const target = Buffer.alloc(buf.length + 2);
        target.writeUint16LE(BOM_BE);
        buf.copy(target, 2);
        return target;
    }
    return buf;
}

export function encodeUtf16BE(str: string, bom = true) {
    return swapBytesInPlace(encodeUtf16LE(str, bom));
}

export function calcEncodingFromBom(buf: Buffer): 'utf16be' | 'utf16le' | undefined {
    if (buf.length < 2) return undefined;
    switch ((buf[0] << 8) | buf[1]) {
        case BOM_BE:
            return 'utf16be';
        case BOM_LE:
            return 'utf16le';
    }
    return undefined;
}
