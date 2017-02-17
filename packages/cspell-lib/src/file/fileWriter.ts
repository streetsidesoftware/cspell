
import * as fs from 'fs';
import * as zlib from 'zlib';
import * as stream from 'stream';
import * as Rx from 'rxjs/Rx';
import { rxToStream } from 'rxjs-stream';

export function writeToFile(filename: string, data: string) {
    const buffer = Buffer.from(data);
    const bufferStream = new stream.PassThrough();
    bufferStream.end( buffer);
    const zip = filename.match(/\.gz$/) ? zlib.createGzip() : new stream.PassThrough();
    return bufferStream.pipe(zip).pipe(fs.createWriteStream(filename));
}


export function writeToFileRx(filename: string, data: Rx.Observable<string>): fs.WriteStream {
    const sourceStream = rxToStream(data);

    const writeStream = fs.createWriteStream(filename);
    const zip = filename.match(/\.gz$/) ? zlib.createGzip() : new stream.PassThrough();

    return sourceStream.pipe(zip).pipe(writeStream);
}

export function writeToFileRxP(filename: string, data: Rx.Observable<string>): Promise<void> {
    const stream = writeToFileRx(filename, data);
    return new Promise<void>((resolve, reject) => {
        stream.on('finish', () => resolve());
        stream.on('error', (e: Error) => reject(e));
    });
}
