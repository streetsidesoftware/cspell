// cSpell:ignore curr
// cSpell:words zlib iconv
import * as fs from 'fs';
import * as zlib from 'zlib';

const defaultEncoding: BufferEncoding = 'utf8';

export function readFile(filename: string, encoding: BufferEncoding = defaultEncoding): Promise<string> {
    return new Promise((resolve, reject) => {
        const data: string[] = [];
        const stream = prepareFileStream(filename, encoding, reject);
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

const isZipped = /\.gz$/i;

function prepareFileStream(filename: string, encoding: BufferEncoding, fnError: (e: Error) => void) {
    const pipes: NodeJS.ReadWriteStream[] = [];
    if (isZipped.test(filename)) {
        pipes.push(zlib.createGunzip());
    }
    const fileStream = fs.createReadStream(filename);
    fileStream.on('error', fnError);
    const stream = pipes.reduce<NodeJS.ReadableStream>((s, p) => s.pipe(p).on('error', fnError), fileStream);
    stream.setEncoding(encoding);
    return stream;
}

export function readFileSync(filename: string, encoding: BufferEncoding = defaultEncoding): string {
    const rawData = fs.readFileSync(filename);
    const data = isZipped.test(filename) ? zlib.gunzipSync(rawData) : rawData;
    return data.toString(encoding);
}
