export interface WordsCollection {
    size: number;
    has(words: string): boolean;
    type?: string;
}

/**
 * Collection of words to be allowed after splitting.
 */
export interface AllowedSplitWordsCollection extends WordsCollection {
    type?: 'AllowedSplitWordsCollection';
}

export const defaultAllowedSplitWords: AllowedSplitWordsCollection = Object.freeze({ size: 0, has: () => true });

/**
 * Collection of words to be excluded.
 */
export interface ExcludeWordsCollection extends WordsCollection {
    type?: 'ExcludeWordsCollection';
}

export const defaultExcludeWordsCollection: ExcludeWordsCollection = Object.freeze({ size: 0, has: () => false });
