import { promises as fs } from 'fs';

import { StrongWeakMap } from '../StrongWeakMap.js';

const cache = new StrongWeakMap<string, Promise<string>>();

export function readTextFile(filename: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
    return cache.autoGet(filename, () => fs.readFile(filename, encoding));
}
