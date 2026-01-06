import fs from 'node:fs/promises';

import { compressIfNeeded } from '../gzip/index.ts';

/**
 * Writes a file to disk and compress as needed.
 *
 * Strings will be encoded as UTF-8.
 *
 * Compression logic:
 * - If the data is a string and the filePath and in `.gz` it is compressed.
 * - If the data is a Uint8Array and the filePath ends in `.gz` the first
 *
 * @param filePath - path to write the file to
 * @param data - data to write
 */
export async function writeFile(filePath: string, data: string | Uint8Array): Promise<void> {
    const buf = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    const shouldCompress = filePath.endsWith('.gz');
    const toWrite = shouldCompress ? await compressIfNeeded(buf) : buf;
    return fs.writeFile(filePath, toWrite);
}
