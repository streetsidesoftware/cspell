import { promises as fsp } from 'node:fs';
import * as path from 'node:path';

import { isDynamicPattern } from 'tinyglobby';

import { STDIN } from './constants.js';
import { isError } from './errors.js';
import { isStdinUrl } from './stdinUrl.js';

export interface SymlinkChecker {
    /**
     * Check if a file is a symbolic link or is reached through a linked directory.
     * For a file under the root, each path segment below the root is checked.
     * For a file outside the root, only the file itself is checked.
     * Links are not followed.
     */
    isReachedThroughSymlink(filename: string): Promise<boolean>;
    /**
     * Check if the fixed part of a glob pattern (the path before the first wildcard) goes through a symbolic link.
     * @param pattern - a glob pattern relative to the root, or absolute.
     */
    isGlobReachedThroughSymlink(pattern: string): Promise<boolean>;
    isBrokenSymlink(filename: string): Promise<boolean>;
    findBrokenSymlinkInGlob(pattern: string): Promise<string | undefined>;
}

export function createSymlinkChecker(root: string): SymlinkChecker {
    const rootPath = path.resolve(root);
    const cache = new Map<string, Promise<boolean>>();

    function isSymlink(filename: string): Promise<boolean> {
        let found = cache.get(filename);
        if (!found) {
            found = fsp.lstat(filename).then(
                (s) => s.isSymbolicLink(),
                () => false,
            );
            cache.set(filename, found);
        }
        return found;
    }

    async function isReachedThroughSymlink(filename: string): Promise<boolean> {
        if (filename === STDIN || isStdinUrl(filename)) return false;
        const absFilename = path.resolve(rootPath, filename);
        const rel = path.relative(rootPath, absFilename);
        if (!rel) return false;
        if (rel === '..' || rel.startsWith('..' + path.sep) || path.isAbsolute(rel)) {
            return isSymlink(absFilename);
        }
        let current = rootPath;
        for (const segment of rel.split(path.sep)) {
            current = path.join(current, segment);
            if (await isSymlink(current)) return true;
        }
        return false;
    }

    async function isGlobReachedThroughSymlink(pattern: string): Promise<boolean> {
        const base = getGlobFixedPath(pattern);
        if (!base) return false;
        return isReachedThroughSymlink(path.resolve(rootPath, base));
    }

    async function isBrokenSymlink(filename: string): Promise<boolean> {
        return (await isSymlink(filename)) && (await hasMissingTarget(filename));
    }

    async function findBrokenSymlinkInGlob(pattern: string): Promise<string | undefined> {
        const base = getGlobFixedPath(pattern);
        if (!base) return undefined;

        for (let filename = path.resolve(rootPath, base); filename !== rootPath; filename = path.dirname(filename)) {
            if (filename === path.dirname(filename)) break;
            const link = await fsp.lstat(filename).then(
                (stat) => stat.isSymbolicLink(),
                (error: unknown) => (isMissingPathError(error) ? undefined : false),
            );
            if (link !== undefined) {
                return link && (await hasMissingTarget(filename)) ? filename : undefined;
            }
        }
        return undefined;
    }

    return { isReachedThroughSymlink, isGlobReachedThroughSymlink, isBrokenSymlink, findBrokenSymlinkInGlob };
}

function getGlobFixedPath(pattern: string): string {
    const fixed: string[] = [];
    for (const segment of pattern.split('/')) {
        if (isDynamicPattern(segment)) break;
        fixed.push(segment);
    }
    return fixed.join('/');
}

function hasMissingTarget(filename: string): Promise<boolean> {
    return fsp.stat(filename).then(() => false, isMissingPathError);
}

export function isMissingPathError(error: unknown): boolean {
    return isError(error) && (error.code === 'ENOENT' || error.code === 'ENOTDIR');
}
