// cSpell:ignore curr
// cSpell:words zlib iconv
import * as fs from 'fs';
import * as Stream from 'stream';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import * as zlib from 'zlib';

import { decode } from '../../common/encode-decode.js';
import { createDecoderTransformer } from '../../common/transformers.js';
import type { BufferEncoding } from '../../models/BufferEncoding.js';
import { fetch } from './fetch.js';
import { FetchUrlError } from './FetchError.js';
import { isFileURL, isSupportedURL, isZipped, toURL } from './util.js';

const defaultEncoding: BufferEncoding = 'utf8';

const pipeline = promisify(Stream.pipeline);

export async function readFileText(filename: string | URL, encoding?: BufferEncoding): Promise<string> {
    const url = toURL(filename);
    if (!isSupportedURL(url)) {
        throw new Error('Unsupported network protocol');
    }
    return isFileURL(url) ? _readFileText(url, encoding) : _fetchTextFromURL(url, encoding);
}

function _readFileText(url: URL, encoding?: BufferEncoding): Promise<string> {
    // Convert it to a string because Yarn2 cannot handle URLs.
    const filename = fileURLToPath(url);
    return _readText(() => fs.createReadStream(filename), isZipped(filename), encoding);
}

async function _fetchTextFromURL(url: URL, encoding?: BufferEncoding): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
        throw FetchUrlError.create(url, response.status);
    }
    return _readText(() => response.body, isZipped(url), encoding);
}

async function _readText(
    getStream: () => NodeJS.ReadableStream,
    isZipped: boolean,
    encoding?: BufferEncoding
): Promise<string> {
    const stream = getStream();
    const decoder = createDecoderTransformer(encoding);
    const collector = createTextCollector(encoding || defaultEncoding);
    return isZipped ? pipeline(stream, zlib.createGunzip(), decoder, collector) : pipeline(stream, decoder, collector);
}

export function readFileTextSync(filename: string, encoding?: BufferEncoding): string {
    const rawData = fs.readFileSync(filename);
    const data = isZipped(filename) ? zlib.gunzipSync(rawData) : rawData;

    return !encoding || encoding.startsWith('utf') ? decode(data) : data.toString(encoding);
}

function createTextCollector(encoding: BufferEncoding) {
    async function collect(iterable: AsyncIterable<string | Buffer>): Promise<string> {
        const buf: string[] = [];
        for await (const sb of iterable) {
            buf.push(typeof sb === 'string' ? sb : sb.toString(encoding));
        }
        return buf.join('');
    }
    return collect;
}
