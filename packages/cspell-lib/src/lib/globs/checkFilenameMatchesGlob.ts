import type { Glob } from '@cspell/cspell-types';

import { getGlobMatcherForExcluding, getGlobMatcherForExcludingFilesOnly } from './getGlobMatcher.js';

/**
 * @param filename - filename
 * @param globs - globs
 * @returns true if it matches
 */
export function checkFilenameMatchesExcludeGlob(filename: string, globs: Glob | Glob[]): boolean {
    const m = getGlobMatcherForExcluding(globs);
    return m.match(filename);
}

/**
 * Like {@link checkFilenameMatchesExcludeGlob}, but a glob only matches the path it names.
 * A glob ending in `/` still matches the files inside the folder.
 * @param filename - filename
 * @param globs - globs
 * @returns true if it matches
 */
export function checkFilenameMatchesExcludeGlobFilesOnly(filename: string, globs: Glob | Glob[]): boolean {
    const m = getGlobMatcherForExcludingFilesOnly(globs);
    return m.match(filename);
}
