export const FLAG_WORD = 1;

export class ChildMap extends Map<string, TrieNode> {}
export interface TrieNode {
    f?: number; // flags
    c?: ChildMap;
}

export interface TrieOptions {
    compoundCharacter: string;
    stripCaseAndAccentsPrefix: string;
    forbiddenWordPrefix: string;
}

export type PartialTrieOptions = Partial<TrieOptions> | undefined;

export interface TrieRoot extends TrieOptions {
    c: ChildMap;
}
