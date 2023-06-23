import { readFileText, readFileTextSync } from 'cspell-io';

import { toIterableIterator } from './iterableIteratorLib.js';

export async function readLines(
    filename: string,
    encoding: BufferEncoding = 'utf8'
): Promise<IterableIterator<string>> {
    try {
        const content = await readFileText(filename, encoding);
        return toIterableIterator(content.split(/\r?\n/g));
    } catch (e) {
        return Promise.reject(e);
    }
}

export function readLinesSync(filename: string, encoding: BufferEncoding = 'utf8'): string[] {
    const content = readFileTextSync(filename, encoding);
    return content.split(/\r?\n/g);
}
