import type { ITrie } from 'cspell-trie-lib';

export interface ReaderOptions {
    /**
     * Max Hunspell recursive depth.
     */
    maxDepth?: number | undefined;
}

export type AnnotatedWord = string;

export interface BaseReader {
    filename: string;
    size: number;
    type: 'Hunspell' | 'TextFile' | 'Trie';
    lines: Iterable<AnnotatedWord>;
    readonly hasWord?: (word: string, caseSensitive: boolean) => boolean;
}

export interface Reader extends BaseReader {
    readonly toTrie: () => ITrie;
}

export interface DictionaryReader extends Reader {
    readonly hasWord: (word: string, caseSensitive: boolean) => boolean;
}
