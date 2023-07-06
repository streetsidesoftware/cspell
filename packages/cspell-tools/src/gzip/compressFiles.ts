import { readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { gzip as gz } from 'node:zlib';

const gzip = promisify(gz);

export async function compressFile(file: string): Promise<string> {
    if (file.endsWith('.gz')) return file;

    const targetFile = file + '.gz';

    const buf = await readFile(file);
    const zBuf = await gzip(buf);
    await writeFile(targetFile, zBuf);
    return targetFile;
}
