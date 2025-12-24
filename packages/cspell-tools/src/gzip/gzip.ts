import { globP } from '../util/globP.ts';
import type { OSFlags } from './compressFiles.ts';
import { compressFile } from './compressFiles.ts';

// cspell:ignore nodir

export async function gzip(globs: string[], os?: OSFlags): Promise<void> {
    const files = await globP(globs, { nodir: true });
    for (const fileName of files) {
        await compressFile(fileName, os);
    }
}
