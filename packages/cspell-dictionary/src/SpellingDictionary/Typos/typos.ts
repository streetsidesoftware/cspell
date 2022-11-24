import type { TermsDefKey, TermValueTypo, TermValueTypoNoSuggestions, TermValueTypoWithSuggestions } from '../Terms';

export type TypoValueNoSuggestions = TermValueTypoNoSuggestions;
export type TypoValueWithSuggestions = TermValueTypoWithSuggestions;

export type TyposDefValue = TermValueTypo;
export type TyposDefKey = TermsDefKey;

/**
 * Typos Definition
 *   key - the incorrect word
 *   value - the suggestions.
 */
export type TyposDef = Record<TyposDefKey, TyposDefValue>;

type TypoWithNoSuggestions = string;
type TypoWithSuggestionsArray = [forbidWord: string, ...suggestions: string[]];
type TypoWithSuggestionsObj = TyposDef;
type TypoWithSuggestions = TypoWithSuggestionsArray | TypoWithSuggestionsObj;

export type TypoEntry = TypoWithNoSuggestions | TypoWithSuggestions;
