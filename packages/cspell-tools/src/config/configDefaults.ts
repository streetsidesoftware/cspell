import type { RequireFields } from '../types.js';
import type { CompileSourceOptions } from './config.js';

export const defaultCompileSourceOptions = {
    maxDepth: undefined,
    split: false,
    keepRawCase: false,
    allowedSplitWords: undefined,
    storeSplitWordsAsCompounds: false,
    minCompoundLength: 4,
} as const satisfies RequireFields<CompileSourceOptions>;
