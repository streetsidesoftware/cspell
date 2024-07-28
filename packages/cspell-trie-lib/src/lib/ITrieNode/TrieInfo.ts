import type { PartialWithUndefined } from '../types.js';

export interface TrieInfo {
    compoundCharacter: string;
    stripCaseAndAccentsPrefix: string;
    forbiddenWordPrefix: string;
    isCaseAware: boolean;
}

export interface TrieCharacteristics {
    hasForbiddenWords: boolean;
    hasCompoundWords: boolean;
    hasNonStrictWords: boolean;
}

export type PartialTrieInfo = PartialWithUndefined<TrieInfo> | undefined;
