import { readFile } from 'cspell-io';
import { toIterableIterator } from './iterableIteratorLib';

export async function readLines(filename: string, encoding: BufferEncoding = 'utf8') {
    try {

        const content = await readFile(filename, encoding);
        return toIterableIterator(content.split(/\r?\n/g));
    } catch (e) {
        return Promise.reject(e);
    }
}
