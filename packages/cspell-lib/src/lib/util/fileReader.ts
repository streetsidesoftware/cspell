import { type TextEncoding, toFileURL } from 'cspell-io';

import { readTextFile } from '../fileSystem.js';
import { toIterableIterator } from './iterableIteratorLib.js';

export async function readLines(url: URL | string, encoding: TextEncoding = 'utf8'): Promise<IterableIterator<string>> {
    url = toFileURL(url);
    const content = await readTextFile(url, encoding);
    return toIterableIterator(content.split(/\r?\n/g));
}
