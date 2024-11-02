import type { CompileSourceOptions } from './config.js';

/**
 * Make all properties in T required
 */
type RequireAllFields<T> = {
    [P in keyof Required<T>]: T[P];
};

export const defaultCompileSourceOptions = {
    maxDepth: undefined,
    split: false,
    keepRawCase: false,
    allowedSplitWords: undefined,
    storeSplitWordsAsCompounds: false,
    minCompoundLength: 4,
} as const satisfies RequireAllFields<CompileSourceOptions>;
