export interface AllowedSplitWords {
    size: number;
    has(words: string): boolean;
}

export const defaultAllowedSplitWords: AllowedSplitWords = Object.freeze({ size: 0, has: () => true });
