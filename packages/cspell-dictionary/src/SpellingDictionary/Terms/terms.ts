export type TermValueTypoNoSuggestions = false;
type TermValueTypoSingleSuggestion = string;
type TermValueTypoMultipleSuggestions = string[];
export type TermValueTypoWithSuggestions = TermValueTypoSingleSuggestion | TermValueTypoMultipleSuggestions;
export type TermValueTypo = TermValueTypoWithSuggestions | TermValueTypoNoSuggestions;

export type TermValueIgnoreWord = null;
export type TermValueOk = true;

export type TermsDefValue = TermValueTypo | TermValueIgnoreWord | TermValueOk;
export type TermsDefKey = string;

export type TermsDef = Record<TermsDefKey, TermsDefValue>;
