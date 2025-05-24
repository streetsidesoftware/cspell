import type { Issue, MappedText, ReportingConfiguration, TextOffset as TextOffsetRW } from '@cspell/cspell-types';

import type { ValidationIssue } from '../Models/ValidationIssue.js';

export type { TextOffset as TextOffsetRW } from '@cspell/cspell-types';
export type TextOffsetRO = Readonly<TextOffsetRW>;

export interface ValidationOptions extends IncludeExcludeOptions, ReportingConfiguration {
    maxNumberOfProblems?: number;
    maxDuplicateProblems?: number;
    minWordLength?: number;
    // words to always flag as an error
    flagWords?: string[];
    allowCompoundWords?: boolean;
    /** ignore case when checking words against dictionary or ignore words list */
    ignoreCase: boolean;
    ignoreRandomStrings?: boolean | undefined;
    minRandomLength?: number | undefined;
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
    /** A line from the document, the offset is relative to the beginning of the document. */
    line: TextOffsetRO;
    /** A segment of text from the line, the offset is relative to the beginning of the document. */
    segment: TextOffsetRO;
}

export interface MappedTextValidationResult
    extends MappedText,
        Pick<Issue, 'hasSimpleSuggestions' | 'hasPreferredSuggestions' | 'isFlagged' | 'suggestionsEx'> {
    isFound?: boolean | undefined;
}

export type TextValidatorFn = (text: MappedText) => Iterable<MappedTextValidationResult>;
