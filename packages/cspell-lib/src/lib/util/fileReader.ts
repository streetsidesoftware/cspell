import { readFile, readFileSync } from 'cspell-io';

import { toIterableIterator } from './iterableIteratorLib';

export async function readLines(
    filename: string,
    encoding: BufferEncoding = 'utf8'
): Promise<IterableIterator<string>> {
    try {
        const content = await readFile(filename, encoding);
        return toIterableIterator(content.split(/\r?\n/g));
    } catch (e) {
        return Promise.reject(e);
    }
}

export function readLinesSync(filename: string, encoding: BufferEncoding = 'utf8'): string[] {
    const content = readFileSync(filename, encoding);
    return content.split(/\r?\n/g);
}
