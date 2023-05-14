import type { PartialWithUndefined } from '../types.js';

export interface TrieOptions {
    compoundCharacter: string;
    stripCaseAndAccentsPrefix: string;
    forbiddenWordPrefix: string;
}
export type PartialTrieOptions = PartialWithUndefined<TrieOptions> | undefined;
