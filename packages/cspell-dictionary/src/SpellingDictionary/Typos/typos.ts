type NoSuggestion = null | undefined;
type SingleSuggestion = string;
type MultipleSuggestions = string[];

export type TyposDefValue = MultipleSuggestions | SingleSuggestion | NoSuggestion;
export type TyposDefKey = string;

/**
 * Typos Definition
 *   key - the incorrect word
 *   value - the suggestions.
 */
export type TyposDef = Record<TyposDefKey, TyposDefValue>;

type TypoNoSuggestions = string;
type TypoWithSuggestionsArray = [forbidWord: string, ...suggestions: string[]];
type TypoWithSuggestionsObj = TyposDef;
type TypoWithSuggestions = TypoWithSuggestionsArray | TypoWithSuggestionsObj;

export type TypoEntry = TypoNoSuggestions | TypoWithSuggestions;
