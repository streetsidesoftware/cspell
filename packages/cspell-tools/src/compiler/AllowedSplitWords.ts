export interface AllowedSplitWords {
    has(words: string): boolean;
}

export const defaultAllowedSplitWords: AllowedSplitWords = { has: () => true };
