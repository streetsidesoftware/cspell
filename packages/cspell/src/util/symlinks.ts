import { promises as fsp } from 'node:fs';
import * as path from 'node:path';

import { isDynamicPattern } from 'tinyglobby';

import { STDIN } from './constants.js';
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
        const segments = pattern.split('/');
        const fixed: string[] = [];
        for (const segment of segments) {
            if (isDynamicPattern(segment)) break;
            fixed.push(segment);
        }
        const base = fixed.join('/');
        return !base ? false : isReachedThroughSymlink(path.resolve(rootPath, base));
    }

    return { isReachedThroughSymlink, isGlobReachedThroughSymlink };
}
