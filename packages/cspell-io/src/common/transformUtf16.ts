import type { BufferEncodingExt } from './BufferEncoding';
import { calcEncodingFromBom, decodeUtf16BE, decodeUtf16LE, encodeString } from './encode-decode';

/**
 *
 * @param iterable
 */
export async function* decoderUtf(
    iterable: AsyncIterable<string | Buffer> | Iterable<string | Buffer>
): AsyncIterable<string> {
    let decoder: ((buf: Buffer) => string) | undefined = undefined;

    for await (const sb of iterable) {
        if (typeof sb === 'string') {
            yield sb;
            continue;
        }
        if (sb.length < 2) {
            yield decodeUtf8(sb);
            continue;
        }
        if (decoder) {
            yield decoder(sb);
            continue;
        }
        decoder = decodeUtf8;
        const encoding = calcEncodingFromBom(sb);
        if (encoding === 'utf16le') {
            decoder = decodeUtf16LE;
            yield decoder(sb.subarray(2));
            continue;
        }
        if (encoding === 'utf16be') {
            decoder = decodeUtf16BE;
            yield decoder(sb.subarray(2));
            continue;
        }
        yield decoder(sb);
    }
}

export function encoderUtf(iterable: Iterable<string>, encoding?: BufferEncodingExt): Iterable<Buffer>;
export function encoderUtf(iterable: AsyncIterable<string>, encoding?: BufferEncodingExt): AsyncIterable<Buffer>;
export function encoderUtf(
    iterable: Iterable<string> | AsyncIterable<string>,
    encoding?: BufferEncodingExt
): Iterable<Buffer> | AsyncIterable<Buffer>;
export function encoderUtf(
    iterable: Iterable<string> | AsyncIterable<string>,
    encoding?: BufferEncodingExt
): Iterable<Buffer> | AsyncIterable<Buffer> {
    return isAsyncIterable(iterable)
        ? encoderUtfAsyncIterable(iterable, encoding)
        : encoderUtfIterable(iterable, encoding);
}

function* encoderUtfIterable(iterable: Iterable<string>, encoding?: BufferEncodingExt): Iterable<Buffer> {
    let useBom = true;

    for (const chunk of iterable) {
        yield encodeString(chunk, encoding, useBom);
        useBom = false;
    }
}

async function* encoderUtfAsyncIterable(
    iterable: Iterable<string> | AsyncIterable<string>,
    encoding?: BufferEncodingExt
): AsyncIterable<Buffer> {
    let useBom = true;

    for await (const chunk of iterable) {
        yield encodeString(chunk, encoding, useBom);
        useBom = false;
    }
}

function decodeUtf8(buf: Buffer): string {
    return buf.toString('utf8');
}

function isAsyncIterable<T>(v: Iterable<T> | AsyncIterable<T>): v is AsyncIterable<T> {
    return v && typeof v === 'object' && !!(<AsyncIterable<T>>v)[Symbol.asyncIterator];
}
