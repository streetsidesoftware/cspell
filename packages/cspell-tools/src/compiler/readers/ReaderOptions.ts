export interface ReaderOptions {
    /**
     * Max Hunspell recursive depth.
     */
    maxDepth?: number;
}

export type AnnotatedWord = string;

export interface BaseReader {
    size: number;
    type: 'Hunspell' | 'TextFile' | 'Trie';
    lines: Iterable<AnnotatedWord>;
}

export interface Reader extends BaseReader, Iterable<string> {}
