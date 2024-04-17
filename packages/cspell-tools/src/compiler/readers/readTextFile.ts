import assert from 'node:assert';
import { promises as fs } from 'node:fs';

import { decompress } from '../../gzip/index.js';

const isGzFile = /\.gz$/;

export function readTextFile(filename: string): Promise<string> {
    const content = fs
        .readFile(filename)
        .then(async (buffer) => (isGzFile.test(filename) ? decompress(buffer) : buffer))
        .then((buffer) => (assertIsBuffer(buffer), buffer.toString('utf8')));
    return content;
}

export async function readTextFileLines(filename: string): Promise<string[]> {
    const content = await readTextFile(filename);
    return content.split('\n');
}

function assertIsBuffer(value: unknown): asserts value is Buffer {
    assert(Buffer.isBuffer(value));
}
