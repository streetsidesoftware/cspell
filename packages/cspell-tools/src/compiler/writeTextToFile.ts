import { promises as fs } from 'node:fs';

import { compress } from '../gzip/index.js';

const isGzFile = /\.gz$/;

export async function writeTextToFile(filename: string, data: string): Promise<void> {
    const useGz = isGzFile.test(filename);
    const buf = Buffer.from(data, 'utf8');
    const buffer = useGz ? await compress(buf) : buf;
    await fs.writeFile(filename, buffer);
}

export function writeTextLinesToFile(filename: string, lines: Iterable<string>): Promise<void> {
    const data = Array.isArray(lines) ? lines.join('') : [...lines].join('');
    return writeTextToFile(filename, data);
}
