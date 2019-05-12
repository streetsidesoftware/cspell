import * as Text from './util/text';
import * as TextRange from './util/TextRange';
import { SpellingDictionary } from './SpellingDictionary';
import { Sequence } from 'gensequence';
export interface ValidationOptions extends IncludeExcludeOptions {
    maxNumberOfProblems?: number;
    maxDuplicateProblems?: number;
    minWordLength?: number;
    flagWords?: string[];
    ignoreWords?: string[];
    words?: string[];
    userWords?: string[];
    allowCompoundWords?: boolean;
}
export interface IncludeExcludeOptions {
    ignoreRegExpList?: (RegExp | string)[];
    includeRegExpList?: (RegExp | string)[];
}
export interface WordRangeAcc {
    textOffset: Text.TextOffset;
    isIncluded: boolean;
    rangePos: number;
}
export declare const defaultMaxNumberOfProblems = 200;
export declare const defaultMaxDuplicateProblems = 5;
export declare const defaultMinWordLength = 4;
export declare const minWordSplitLen = 3;
export declare function validateText(text: string, dict: SpellingDictionary, options: ValidationOptions): Sequence<Text.TextOffset>;
export declare function calcTextInclusionRanges(text: string, options: IncludeExcludeOptions): TextRange.MatchRange[];
export declare function isWordValid(dict: SpellingDictionary, wo: Text.TextOffset, text: string, allowCompounds: boolean): boolean;
export declare function hasWordCheck(dict: SpellingDictionary, word: string, allowCompounds: boolean): boolean;
