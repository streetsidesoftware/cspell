import type { MappedText, TextOffset as TextOffsetRW } from '@cspell/cspell-types';

import type { ExtendedSuggestion } from '../Models/Suggestion.js';
import type { ValidationIssue } from '../Models/ValidationIssue.js';

export type { TextOffset as TextOffsetRW } from '@cspell/cspell-types';
export type TextOffsetRO = Readonly<TextOffsetRW>;

export interface ValidationOptions extends IncludeExcludeOptions {
    maxNumberOfProblems?: number;
    maxDuplicateProblems?: number;
    minWordLength?: number;
    // words to always flag as an error
    flagWords?: string[];
    allowCompoundWords?: boolean;
    /** ignore case when checking words against dictionary or ignore words list */
    ignoreCase: boolean;
}

export interface CheckOptions extends ValidationOptions {
    allowCompoundWords: boolean;
    ignoreCase: boolean;
}

export interface IncludeExcludeOptions {
    ignoreRegExpList?: RegExp[];
    includeRegExpList?: RegExp[];
}

export interface WordRangeAcc {
    textOffset: TextOffsetRO;
    isIncluded: boolean;
    rangePos: number;
}

export type ValidationIssueRO = Readonly<ValidationIssue>;

export type LineValidatorFn = (line: LineSegment) => Iterable<ValidationIssue>;

export interface LineSegment {
    line: TextOffsetRO;
    segment: TextOffsetRO;
}

export interface MappedTextValidationResult extends MappedText {
    isFlagged?: boolean | undefined;
    isFound?: boolean | undefined;
    suggestionsEx?: ExtendedSuggestion[] | undefined;
}

export type TextValidatorFn = (text: MappedText) => Iterable<MappedTextValidationResult>;
