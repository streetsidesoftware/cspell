import type { PartialWithUndefined } from './types';

export const FLAG_WORD = 1;

export class ChildMap extends Map<string, TrieNode> {}
export interface TrieNode {
    f?: number | undefined; // flags
    c?: ChildMap | undefined;
}

export interface TrieOptions {
    compoundCharacter: string;
    stripCaseAndAccentsPrefix: string;
    forbiddenWordPrefix: string;
}

export type PartialTrieOptions = PartialWithUndefined<TrieOptions> | undefined;

export interface TrieRoot extends TrieOptions {
    c: ChildMap;
}
