// eslint-disable-next-line n/no-unsupported-features/node-builtins -- only Node 23 is flagged, and it is past end of life.
import { glob } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { toArray } from '@cspell/cspell-pipe';

interface Options {
    cwd?: string | URL;
    nodir?: boolean; // cspell:ignore nodir
}

export async function globP(pattern: string | string[], options?: Options): Promise<string[]> {
    // Convert windows separators.
    const globs = (Array.isArray(pattern) ? pattern : [pattern]).map((pattern) => pattern.replaceAll('\\', '/'));
    const cwd = options?.cwd ?? '.';
    // Node resolves a relative `cwd` during the search, so a change of directory would change the base.
    const root = resolve(cwd instanceof URL ? fileURLToPath(cwd) : cwd);
    return options?.nodir ? globNonDirectories(globs, root) : toArray(glob(globs, { cwd: root }));
}

async function globNonDirectories(globs: string[], root: string): Promise<string[]> {
    const entries = await toArray(glob(globs, { cwd: root, withFileTypes: true }));
    return entries
        .filter((entry) => !entry.isDirectory())
        .map((entry) => relative(root, join(entry.parentPath, entry.name)));
}
