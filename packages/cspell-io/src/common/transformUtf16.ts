import { calcEncodingFromBom, decodeUtf16BE, decodeUtf16LE } from './encode-decode';

/**
 *
 * @param iterable
 */
export async function* decodeUtf(
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

function decodeUtf8(buf: Buffer): string {
    return buf.toString('utf8');
}
