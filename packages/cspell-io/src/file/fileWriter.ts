import * as fs from 'fs';
import * as zlib from 'zlib';
import * as stream from 'stream';
import { iterableToStream } from 'iterable-to-stream';

export function writeToFile(filename: string, data: string): fs.WriteStream {
    return writeToFileIterable(filename, [data]);
}

export function writeToFileIterable(
    filename: string,
    data: Iterable<string>
): fs.WriteStream {
    const sourceStream = iterableToStream(data);
    const writeStream = fs.createWriteStream(filename);
    const zip = filename.match(/\.gz$/)
        ? zlib.createGzip()
        : new stream.PassThrough();
    return sourceStream.pipe(zip).pipe(writeStream);
}

export function writeToFileIterableP(
    filename: string,
    data: Iterable<string>
): Promise<void> {
    const stream = writeToFileIterable(filename, data);
    return new Promise<void>((resolve, reject) => {
        stream.on('finish', () => resolve());
        stream.on('error', (e: Error) => reject(e));
    });
}
