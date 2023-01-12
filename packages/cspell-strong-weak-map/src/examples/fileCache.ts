import { promises as fs } from 'fs';

import { StrongWeakMap } from '../StrongWeakMap';

const cache = new StrongWeakMap<string, Promise<string>>();

export function readTextFile(filename: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
    const cached = cache.get(filename);
    if (cached) return cached;

    const content = fs.readFile(filename, encoding);

    cache.set(filename, content);

    return content;
}
