import type { TrieCharacteristics, TrieInfo } from './ITrieNode/TrieInfo.ts';

export const COMPOUND_FIX = '+';
export const OPTIONAL_COMPOUND_FIX = '*';
export const CASE_INSENSITIVE_PREFIX = '~';
export const FORBID_PREFIX = '!';
export const LINE_COMMENT = '#';
export const IDENTITY_PREFIX = '=';
export const SUGGESTION_PREFIX = ':';
export const SUGGESTIONS_DISABLED = '\0';

export const defaultTrieInfo: TrieInfo = Object.freeze({
    compoundCharacter: COMPOUND_FIX,
    forbiddenWordPrefix: FORBID_PREFIX,
    stripCaseAndAccentsPrefix: CASE_INSENSITIVE_PREFIX,
    suggestionPrefix: SUGGESTION_PREFIX,
});

export const defaultCharacteristics: Readonly<TrieCharacteristics> = {
    hasForbiddenWords: false,
    hasCompoundWords: false,
    hasNonStrictWords: false,
    hasPreferredSuggestions: false,
};
