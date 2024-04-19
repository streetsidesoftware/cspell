import * as fs from 'node:fs';
import * as Stream from 'node:stream';
import { promisify } from 'node:util';
import * as zlib from 'node:zlib';

import type { BufferEncoding, BufferEncodingExt } from '../../common/BufferEncoding.js';
import { encoderTransformer } from '../../common/transformers.js';

const pipeline = promisify(Stream.pipeline);

export function writeToFile(
    filename: string,
    data: string | Iterable<string> | AsyncIterable<string>,
    encoding?: BufferEncoding,
): Promise<void> {
    return writeToFileIterable(filename, typeof data === 'string' ? [data] : data, encoding);
}

export function writeToFileIterable(
    filename: string,
    data: Iterable<string> | AsyncIterable<string>,
    encoding?: BufferEncodingExt,
): Promise<void> {
    const stream = Stream.Readable.from(encoderTransformer(data, encoding));
    const zip = /\.gz$/.test(filename) ? zlib.createGzip() : new Stream.PassThrough();
    return pipeline(stream, zip, fs.createWriteStream(filename));
}
