import { promises as fs } from 'fs';
import { promisify } from 'util';
import * as zlib from 'zlib';

const gunzip = promisify(zlib.gunzip);

const isGzFile = /\.gz$/;

export function readTextFile(filename: string): Promise<string> {
    const content = fs
        .readFile(filename)
        .then((buffer) => (isGzFile.test(filename) ? gunzip(buffer) : buffer))
        .then((buffer) => buffer.toString('utf8'));
    return content;
}

export async function readTextFileLines(filename: string): Promise<string[]> {
    const content = await readTextFile(filename);
    return content.split('\n');
}
