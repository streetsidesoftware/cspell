import type { RequireFields } from '../types.js';
import type { CompileSourceOptions } from './config.js';

export const defaultCompileSourceOptions: {
    readonly maxDepth: undefined;
    readonly split: false;
    readonly keepRawCase: false;
    readonly allowedSplitWords: undefined;
    readonly storeSplitWordsAsCompounds: false;
    readonly minCompoundLength: 4;
} = {
    maxDepth: undefined,
    split: false,
    keepRawCase: false,
    allowedSplitWords: undefined,
    storeSplitWordsAsCompounds: false,
    minCompoundLength: 4,
} as const satisfies RequireFields<CompileSourceOptions>;
