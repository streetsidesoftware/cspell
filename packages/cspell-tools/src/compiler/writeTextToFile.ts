import { promises as fs } from 'fs';
import { promisify } from 'util';
import * as zlib from 'zlib';

const gzip = promisify(zlib.gzip);

const isGzFile = /\.gz$/;

export async function writeTextToFile(filename: string, data: string): Promise<void> {
    const useGz = isGzFile.test(filename);
    const buf = Buffer.from(data, 'utf-8');
    const buffer = useGz ? await gzip(buf) : buf;
    await fs.writeFile(filename, buffer);
}

export function writeTextLinesToFile(filename: string, lines: Iterable<string>): Promise<void> {
    const data = Array.isArray(lines) ? lines.join('') : [...lines].join('');
    return writeTextToFile(filename, data);
}
