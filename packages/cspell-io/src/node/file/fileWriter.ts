import * as fs from 'fs';
import * as Stream from 'stream';
import { promisify } from 'util';
import * as zlib from 'zlib';

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
    const zip = filename.match(/\.gz$/) ? zlib.createGzip() : new Stream.PassThrough();
    return pipeline(stream, zip, fs.createWriteStream(filename));
}
