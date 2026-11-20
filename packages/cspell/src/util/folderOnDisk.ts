import { readdirSync, statSync } from 'node:fs';
import * as path from 'node:path';

/**
 * Find a folder and spell its path the way the file system lists it, so two spellings of one folder give the same
 * path. Symbolic links are kept, not followed.
 *
 * @returns the path, or `undefined` when it isn't an existing folder.
 */
export function findFolderOnDisk(folder: string): string | undefined {
    const absolute = path.resolve(folder);
    if (!isFolder(absolute)) return undefined;
    const { root } = path.parse(absolute);
    let found = root;
    for (const segment of absolute.slice(root.length).split(path.sep)) {
        if (!segment) continue;
        found = path.join(found, listedName(found, segment));
    }
    return found;
}

function isFolder(folder: string): boolean {
    try {
        return statSync(folder).isDirectory();
    } catch {
        return false;
    }
}

/**
 * The folder exists, so a name in the parent matches the segment. When the parent can't be listed, or the file system
 * matches names in a way this doesn't, the segment is kept as given.
 */
function listedName(parent: string, segment: string): string {
    let names: string[];
    try {
        names = readdirSync(parent);
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
