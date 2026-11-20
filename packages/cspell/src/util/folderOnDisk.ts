import { readdir, stat } from 'node:fs/promises';
import * as path from 'node:path';

/**
 * Looks up folders and spells their paths the way the file system lists them, so two spellings of one folder give the
 * same path. Symbolic links are kept, not followed.
 */
export interface FolderLookup {
    /**
     * @returns the path, or `undefined` when it isn't an existing folder.
     */
    find(folder: string): Promise<string | undefined>;
}

/**
 * The current directory and its parents are known from the start, and each folder found is added. A lookup only lists
 * the folders below the deepest known one, so looking up one folder at a time lets each use what the others found.
 */
export function createFolderLookup(): FolderLookup {
    const known = currentDirectoryAndParents();
    return { find: (folder) => findFolder(path.resolve(folder), known) };
}

async function findFolder(absolute: string, known: Set<string>): Promise<string | undefined> {
    if (known.has(absolute)) return absolute;
    if (!(await isFolder(absolute))) return undefined;
    const segments: string[] = [];
    let found = absolute;
    while (!known.has(found) && path.dirname(found) !== found) {
        segments.push(path.basename(found));
        found = path.dirname(found);
    }
    for (const segment of segments.reverse()) {
        found = path.join(found, await listedName(found, segment));
        known.add(found);
    }
    return found;
}

function currentDirectoryAndParents(): Set<string> {
    let folder = process.cwd();
    const known = new Set([folder]);
    while (path.dirname(folder) !== folder) {
        folder = path.dirname(folder);
        known.add(folder);
    }
    return known;
}

async function isFolder(folder: string): Promise<boolean> {
    try {
        return (await stat(folder)).isDirectory();
    } catch {
        return false;
    }
}

/**
 * The folder exists, so a name in the parent matches the segment. When the parent can't be listed, or the file system
 * matches names in a way this doesn't, the segment is kept as given.
 */
async function listedName(parent: string, segment: string): Promise<string> {
    let names: string[];
    try {
        names = await readdir(parent);
    } catch {
        return segment;
    }
    if (names.includes(segment)) return segment;
    const key = toNameKey(segment);
    return names.find((name) => toNameKey(name) === key) ?? segment;
}

function toNameKey(name: string): string {
    return name.normalize('NFC').toLowerCase();
}
