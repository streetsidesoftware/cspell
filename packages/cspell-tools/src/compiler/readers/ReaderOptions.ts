export interface ReaderOptions {
    /**
     * Max Hunspell recursive depth.
     */
    maxDepth?: number | undefined;
}

export type AnnotatedWord = string;

export interface BaseReader {
    size: number;
    type: 'Hunspell' | 'TextFile' | 'Trie';
    lines: Iterable<AnnotatedWord>;
    readonly hasWord?: (word: string, caseSensitive: boolean) => boolean;
}

export interface Reader extends BaseReader {}

export interface DictionaryReader extends BaseReader {
    readonly hasWord: (word: string, caseSensitive: boolean) => boolean;
}
