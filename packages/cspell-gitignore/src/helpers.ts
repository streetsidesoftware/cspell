import findUp from 'find-up';
import * as path from 'path';

/**
 * Parse a directory and return its root
 * @param directory - directory to parse.
 * @returns root directory
 */
export function directoryRoot(directory: string): string {
    const p = path.parse(directory);
    return p.root;
}

/**
 * Find the git repository root directory.
 * @param directory - directory to search up from.
 * @returns resolves to `.git` root or undefined
 */
export async function findRepoRoot(directory: string): Promise<string | undefined> {
    const found = await findUp('.git', { cwd: directory, type: 'directory' });
    if (!found) return undefined;
    return path.dirname(found);
}

/**
 * Checks to see if the child directory is nested under the parent directory.
 * @param parent - parent directory
 * @param child - possible child directory
 * @returns true iff child is a child of parent.
 */
export function isParentOf(parent: string, child: string): boolean {
    const rel = path.relative(parent, child);
    return !!rel && !path.isAbsolute(rel) && rel[0] !== '.';
}

/**
 * Check to see if a parent directory contains a child directory.
 * @param parent - parent directory
 * @param child - child directory
 * @returns true iff child is the same as the parent or nested in the parent.
 */
export function contains(parent: string, child: string): boolean {
    const rel = path.relative(parent, child);
    return !rel || (!path.isAbsolute(rel) && rel[0] !== '.');
}
