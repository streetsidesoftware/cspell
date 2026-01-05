import { promises as fs } from 'node:fs';

import { decompress } from '../../gzip/index.ts';

const isGzFile = /\.gz$/;

export function readTextFile(filename: string): Promise<string> {
    const content = readFile(filename).then((buffer) => {
        return new TextDecoder('utf-8').decode(buffer);
    });
    return content;
}

export function readFile(filename: string): Promise<Uint8Array<ArrayBuffer>> {
    const content = fs
        .readFile(filename)
        .then(async (buffer) => (isGzFile.test(filename) ? decompress(buffer) : buffer));
    return content;
}

export async function readTextFileLines(filename: string): Promise<string[]> {
    const content = await readTextFile(filename);
    return content.split('\n');
}
