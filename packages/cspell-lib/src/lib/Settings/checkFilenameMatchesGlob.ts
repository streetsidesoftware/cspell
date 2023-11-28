import { checkFilenameMatchesExcludeGlob } from '../globs/checkFilenameMatchesGlob.js';

/**
 * @param filename - filename
 * @param globs - globs
 * @returns true if it matches
 * @deprecated true
 * @deprecationMessage No longer actively supported. Use package: `cspell-glob`.
 */
export const checkFilenameMatchesGlob = checkFilenameMatchesExcludeGlob;
