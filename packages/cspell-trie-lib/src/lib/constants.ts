import type { TrieInfo } from './ITrieNode/TrieInfo.js';

export const COMPOUND_FIX = '+';
export const OPTIONAL_COMPOUND_FIX = '*';
export const CASE_INSENSITIVE_PREFIX = '~';
export const FORBID_PREFIX = '!';
export const LINE_COMMENT = '#';
export const IDENTITY_PREFIX = '=';

export const defaultTrieInfo: TrieInfo = Object.freeze({
    compoundCharacter: COMPOUND_FIX,
    forbiddenWordPrefix: FORBID_PREFIX,
    stripCaseAndAccentsPrefix: CASE_INSENSITIVE_PREFIX,
    isCaseAware: true,
    hasForbiddenWords: false,
    hasCompoundWords: false,
    hasNonStrictWords: false,
});
