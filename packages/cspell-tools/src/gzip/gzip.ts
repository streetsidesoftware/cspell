import { globP } from '../util/globP.ts';
import type { OSFlags } from './compressFiles.ts';
import { compressFile } from './compressFiles.ts';

// cspell:ignore nodir

/**
 * GZip files matching the given globs.
 * @param globs - array of globs to gzip
 * @param os - optional OS flag for the gzip file
 */
export async function gzipFiles(globs: string[], os?: OSFlags): Promise<void> {
    const files = await globP(globs, { nodir: true });
    for (const fileName of files) {
        await compressFile(fileName, os);
    }
}
