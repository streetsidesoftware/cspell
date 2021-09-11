import * as fs from 'fs';
import * as zlib from 'zlib';
import { PassThrough, pipeline as pipelineCB } from 'stream';
import { promisify } from 'util';

const pipeline = promisify(pipelineCB);

const defaultEncoding: BufferEncoding = 'utf8';

export async function readFile(filename: string, encoding: BufferEncoding = defaultEncoding): Promise<string> {
    const isGzip = filename.match(/\.gz$/i);
    const fileStream = fs.createReadStream(filename);
    const zip = isGzip ? zlib.createGunzip() : new PassThrough();
    const t = pipeline(fileStream, zip, streamToText(encoding));
    return await t;
}

function streamToText(encoding: BufferEncoding): (source: fs.ReadStream) => Promise<string> {
    return async function (source: fs.ReadStream): Promise<string> {
        const chunks: string[] = [];
        source.setEncoding(encoding); // Work with strings rather than `Buffer`s.
        for await (const chunk of source) {
            chunks.push(chunk);
        }
        return chunks.join('');
    };
}
