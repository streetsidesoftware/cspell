// cSpell:ignore curr
// cSpell:words zlib iconv
import * as fs from 'fs';
import * as zlib from 'zlib';
import { fetch } from './fetch';
import { FetchUrlError } from './FetchError';
import { toURL, isSupportedURL, isFileURL, isZipped } from './util';
import { fileURLToPath } from 'url';
import type { BufferEncoding } from '../../models/BufferEncoding';

const defaultEncoding: BufferEncoding = 'utf8';

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

function _read(
    getStream: () => NodeJS.ReadableStream,
    isZipped: boolean,
    encoding: BufferEncoding = defaultEncoding
): Promise<string> {
    return new Promise((resolve, reject) => {
        const data: string[] = [];
        const stream = prepareFileStream(getStream, isZipped, encoding, reject);
        let resolved = false;
        function complete() {
            resolve(data.join(''));
            resolved = resolved || (resolve(data.join('')), true);
        }
        stream.on('error', reject);
        stream.on('data', (d: string) => data.push(d));
        stream.on('close', complete);
        stream.on('end', complete);
    });
}

function prepareFileStream(
    getStream: () => NodeJS.ReadableStream,
    isZipped: boolean,
    encoding: BufferEncoding,
    fnError: (e: Error) => void
) {
    const pipes: NodeJS.ReadWriteStream[] = [];
    if (isZipped) {
        pipes.push(zlib.createGunzip());
    }
    const fileStream = getStream();
    fileStream.on('error', fnError);
    const stream = pipes.reduce<NodeJS.ReadableStream>((s, p) => s.pipe(p).on('error', fnError), fileStream);
    stream.setEncoding(encoding);
    return stream;
}

export function readFileSync(filename: string, encoding: BufferEncoding = defaultEncoding): string {
    const rawData = fs.readFileSync(filename);
    const data = isZipped(filename) ? zlib.gunzipSync(rawData) : rawData;
    return data.toString(encoding);
}
