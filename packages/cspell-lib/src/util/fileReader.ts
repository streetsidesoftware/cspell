import { readFile } from 'cspell-io';
import { IterableLike } from 'gensequence';
import { toIterableIterator } from './iterableIteratorLib';

export async function readLines(
    filename: string,
    encoding: BufferEncoding = 'utf8'
): Promise<IterableLike<string>> {
    try {
        const content = await readFile(filename, encoding);
        return toIterableIterator(content.split(/\r?\n/g));
    } catch (e) {
        return Promise.reject(e);
    }
}
