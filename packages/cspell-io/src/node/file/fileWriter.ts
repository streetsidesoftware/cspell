import * as fs from 'fs';
import * as stream from 'stream';
import * as zlib from 'zlib';

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
    const stream = writeToFileIterable(filename, data);
    return new Promise<void>((resolve, reject) => {
        stream.on('finish', () => resolve());
        stream.on('error', (e: Error) => reject(e));
    });
}
