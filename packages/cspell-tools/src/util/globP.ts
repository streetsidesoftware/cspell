// eslint-disable-next-line n/no-unsupported-features/node-builtins -- only Node 23 is flagged, and it is past end of life.
import { glob } from 'node:fs/promises';
import { join, relative } from 'node:path';

import { toArray } from '@cspell/cspell-pipe';

interface Options {
    nodir?: boolean; // cspell:ignore nodir
}

export async function globP(pattern: string | string[], options?: Options): Promise<string[]> {
    // Convert windows separators.
    const globs = (Array.isArray(pattern) ? pattern : [pattern]).map((pattern) => pattern.replaceAll('\\', '/'));
    return options?.nodir ? globNonDirectories(globs) : toArray(glob(globs));
}

async function globNonDirectories(globs: string[]): Promise<string[]> {
    const entries = await toArray(glob(globs, { withFileTypes: true }));
    return entries
        .filter((entry) => !entry.isDirectory())
        .map((entry) => relative(process.cwd(), join(entry.parentPath, entry.name)));
}
