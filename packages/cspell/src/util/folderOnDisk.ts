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
 * The current directory and its parents are known from the start. Each folder found is remembered under the spelling
 * it was given and its spelling on disk. A lookup only lists the folders below the deepest known one, so looking up one
 * folder at a time lets each use what the others found.
 */
export function createFolderLookup(): FolderLookup {
    const known = currentDirectoryAndParents();
    return { find: (folder) => findFolder(path.resolve(folder), known) };
}

/**
 * @param known - maps each folder, as given, to its spelling on disk.
 */
async function findFolder(absolute: string, known: Map<string, string>): Promise<string | undefined> {
    const knownFolder = known.get(absolute);
    if (knownFolder) return knownFolder;
    if (!(await isFolder(absolute))) return undefined;
    const segments: string[] = [];
    let given = absolute;
    while (!known.has(given) && path.dirname(given) !== given) {
        segments.push(path.basename(given));
        given = path.dirname(given);
    }
    let found = known.get(given) ?? given;
    for (const segment of segments.reverse()) {
        given = path.join(given, segment);
        found = path.join(found, await listedName(found, segment));
        known.set(given, found);
        known.set(found, found);
    }
    return found;
}

function currentDirectoryAndParents(): Map<string, string> {
    let folder = process.cwd();
    const known = new Map([[folder, folder]]);
    while (path.dirname(folder) !== folder) {
        folder = path.dirname(folder);
        known.set(folder, folder);
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
