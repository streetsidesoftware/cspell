import * as fs from 'fs';
import * as zlib from 'zlib';
import * as stream from 'stream';
import { promisify } from 'util';

const pipeline = promisify(stream.pipeline);

export function writeToFile(filename: string, data: string): NodeJS.WritableStream {
    return writeToFileIterable(filename, [data]);
}

export function writeToFileIterable(filename: string, data: Iterable<string>): NodeJS.WritableStream {
    const sourceStream = stream.Readable.from(data);
    const writeStream = fs.createWriteStream(filename);
    const zip = filename.match(/\.gz$/) ? zlib.createGzip() : new stream.PassThrough();
    return sourceStream.pipe(zip).pipe(writeStream);
}

export function writeToFileIterableP(filename: string, data: Iterable<string>): Promise<void> {
    const sourceStream = stream.Readable.from(data);
    const writeStream = fs.createWriteStream(filename);
    const zip = filename.match(/\.gz$/) ? zlib.createGzip() : new stream.PassThrough();
    return pipeline(sourceStream, zip, writeStream);
}
