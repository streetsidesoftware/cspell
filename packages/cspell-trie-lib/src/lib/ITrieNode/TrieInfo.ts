import type { PartialWithUndefined } from '../types.js';

export interface TrieInfo {
    compoundCharacter: string;
    stripCaseAndAccentsPrefix: string;
    forbiddenWordPrefix: string;
}
export type PartialTrieInfo = PartialWithUndefined<TrieInfo> | undefined;
