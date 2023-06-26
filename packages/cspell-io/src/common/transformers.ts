import { sliceView } from './arrayBuffers.js';
import type { BufferEncodingExt } from './BufferEncoding.js';
import { calcEncodingFromBom, decode, decodeUtf16BE, decodeUtf16LE, encodeString } from './encode-decode.js';

export function createDecoderTransformer(
    encoding?: BufferEncodingExt
): (iterable: AsyncIterable<string | ArrayBufferView> | Iterable<string | ArrayBufferView>) => AsyncIterable<string> {
    function standardDecoder(buf: ArrayBufferView): string {
        return decode(buf, encoding);
    }

    let decoder: ((buf: ArrayBufferView) => string) | undefined = undefined;

    if (encoding && !encoding.startsWith('utf')) return decoderNonUtf;
    return decoderUtf;

    async function* decoderNonUtf(
        iterable: AsyncIterable<string | ArrayBufferView> | Iterable<string | ArrayBufferView>
    ) {
        for await (const buf of iterable) {
            yield typeof buf === 'string' ? buf : decode(buf, encoding);
        }
    }

    async function* decoderUtf(
        iterable: AsyncIterable<string | ArrayBufferView> | Iterable<string | ArrayBufferView>
    ): AsyncIterable<string> {
        for await (const sb of iterable) {
            if (typeof sb === 'string') {
                yield sb;
                continue;
            }
            if (sb.byteLength < 2) {
                yield standardDecoder(sb);
                continue;
            }
            if (decoder) {
                yield decoder(sb);
                continue;
            }
            decoder = standardDecoder;
            const _encoding = calcEncodingFromBom(sb);
            if (_encoding === 'utf16le') {
                decoder = decodeUtf16LE;
                yield decoder(sliceView(sb, 2));
                continue;
            }
            if (_encoding === 'utf16be') {
                decoder = decodeUtf16BE;
                yield decoder(sliceView(sb, 2));
                continue;
            }
            yield decoder(sb);
        }
    }
}

export function encoderTransformer(iterable: Iterable<string>, encoding?: BufferEncodingExt): Iterable<ArrayBufferView>;
export function encoderTransformer(
    iterable: AsyncIterable<string>,
    encoding?: BufferEncodingExt
): AsyncIterable<ArrayBufferView>;
export function encoderTransformer(
    iterable: Iterable<string> | AsyncIterable<string>,
    encoding?: BufferEncodingExt
): Iterable<ArrayBufferView> | AsyncIterable<ArrayBufferView>;
export function encoderTransformer(
    iterable: Iterable<string> | AsyncIterable<string>,
    encoding?: BufferEncodingExt
): Iterable<ArrayBufferView> | AsyncIterable<ArrayBufferView> {
    return isAsyncIterable(iterable) ? encoderAsyncIterable(iterable, encoding) : encoderIterable(iterable, encoding);
}

function* encoderIterable(iterable: Iterable<string>, encoding?: BufferEncodingExt): Iterable<ArrayBufferView> {
    let useBom = true;

    for (const chunk of iterable) {
        yield encodeString(chunk, encoding, useBom);
        useBom = false;
    }
}

async function* encoderAsyncIterable(
    iterable: Iterable<string> | AsyncIterable<string>,
    encoding?: BufferEncodingExt
): AsyncIterable<ArrayBufferView> {
    let useBom = true;

    for await (const chunk of iterable) {
        yield encodeString(chunk, encoding, useBom);
        useBom = false;
    }
}

function isAsyncIterable<T>(v: Iterable<T> | AsyncIterable<T>): v is AsyncIterable<T> {
    return v && typeof v === 'object' && !!(<AsyncIterable<T>>v)[Symbol.asyncIterator];
}
