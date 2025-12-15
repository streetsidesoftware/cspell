import { Buffer } from 'node:buffer';
import { promises as fs } from 'node:fs';

import { compress } from '../gzip/index.js';

const isGzFile = /\.gz$/;

export async function writeTextToFile(
    filename: string,
    data: string | Iterable<string>,
    useGzCompress?: boolean,
): Promise<void> {
    const dataStr = typeof data === 'string' ? data : Array.isArray(data) ? data.join('') : [...data].join('');
    const hasGzExt = isGzFile.test(filename);
    const useGz = useGzCompress ?? hasGzExt;
    if (useGz && !hasGzExt) {
        filename += '.gz';
    }
    const buf = Buffer.from(dataStr, 'utf8');
    const buffer = useGz ? await compress(buf) : buf;
    await fs.writeFile(filename, buffer);
}
