// cSpell:ignore curr
// cSpell:words zlib iconv
import * as fs from 'fs';
import * as Stream from 'stream';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import * as zlib from 'zlib';

import { decodeUtf } from '../../common/transformUtf16';
import type { BufferEncoding } from '../../models/BufferEncoding';
import { fetch } from './fetch';
import { FetchUrlError } from './FetchError';
import { isFileURL, isSupportedURL, isZipped, toURL } from './util';

const defaultEncoding: BufferEncoding = 'utf8';

const pipeline = promisify(Stream.pipeline);

export async function readFile(filename: string | URL, encoding?: BufferEncoding): Promise<string> {
    const url = toURL(filename);
    if (!isSupportedURL(url)) {
        throw new Error('Unsupported network protocol');
    }
    return isFileURL(url) ? _readFile(url, encoding) : _fetchURL(url, encoding);
}

function _readFile(url: URL, encoding?: BufferEncoding): Promise<string> {
    // Convert it to a string because Yarn2 cannot handle URLs.
    const filename = fileURLToPath(url);
    return _read(() => fs.createReadStream(filename), isZipped(filename), encoding);
}

async function _fetchURL(url: URL, encoding?: BufferEncoding): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
        throw FetchUrlError.create(url, response.status);
    }
    return _read(() => response.body, isZipped(url), encoding);
}

async function _read(
    getStream: () => NodeJS.ReadableStream,
    isZipped: boolean,
    encoding: BufferEncoding = defaultEncoding
): Promise<string> {
    const stream = getStream();
    const collector = createCollector(encoding);
    return isZipped
        ? pipeline(stream, zlib.createGunzip(), decodeUtf, collector)
        : pipeline(stream, decodeUtf, collector);
}

export function readFileSync(filename: string, encoding: BufferEncoding = defaultEncoding): string {
    const rawData = fs.readFileSync(filename);
    const data = isZipped(filename) ? zlib.gunzipSync(rawData) : rawData;
    return data.toString(encoding);
}

function createCollector(encoding: BufferEncoding) {
    async function collect(iterable: AsyncIterable<string | Buffer>): Promise<string> {
        const buf: string[] = [];
        for await (const sb of iterable) {
            buf.push(typeof sb === 'string' ? sb : sb.toString(encoding));
        }
        return buf.join('');
    }
    return collect;
}
