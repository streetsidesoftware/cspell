import * as Text from './util/text';
import { SpellingDictionary } from './SpellingDictionary';
import { Sequence } from 'gensequence';
export interface ValidationOptions {
    maxNumberOfProblems?: number;
    maxDuplicateProblems?: number;
    minWordLength?: number;
    flagWords?: string[];
    ignoreRegExpList?: (RegExp | string)[];
    includeRegExpList?: (RegExp | string)[];
    ignoreWords?: string[];
    words?: string[];
    userWords?: string[];
    allowCompoundWords?: boolean;
}
export interface WordRangeAcc {
    word: Text.WordOffset;
    isIncluded: boolean;
    rangePos: number;
}
export declare const defaultMaxNumberOfProblems = 200;
export declare const defaultMaxDuplicateProblems = 5;
export declare const defaultMinWordLength = 4;
export declare const minWordSplitLen = 3;
export declare function validateText(text: string, dict: SpellingDictionary, options: ValidationOptions): Sequence<Text.WordOffset>;
export declare function isWordValid(dict: SpellingDictionary, wo: Text.WordOffset, text: string, allowCompounds: boolean): boolean;
export declare function hasWordCheck(dict: SpellingDictionary, word: string, allowCompounds: boolean): boolean;
export declare function hasCompoundWord(dict: SpellingDictionary, word: string): boolean;
export declare function wordSplitter(word: string): Sequence<[string, string]>;
