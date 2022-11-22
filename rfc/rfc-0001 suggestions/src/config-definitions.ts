import type { DictionaryDefinitionPreferred, BaseSetting, DictionaryId, DictionaryPath } from '@cspell/cspell-types';

interface ChangesToBase {
    type: 'suggestions' | 'words';
}

export interface DictionaryDefinitionSuggestions extends Omit<DictionaryDefinitionPreferred, 'type'>, ChangesToBase {
    /** The name of the dictionary */
    name: DictionaryId;

    /** Path to the file. */
    path: DictionaryPath;

    /** The type of dictionary */
    type: 'suggestions';
}

const exampleDef: DictionaryDefinitionSuggestions = {
    name: 'en-us-suggestions',
    path: './en-suggestions.txt.gz',
    type: 'suggestions',
};

/*********************/

type FlagWordNoSuggestions = string;
type FlagWordWithSuggestionsArray = [forbidWord: string, suggestion: string, ...otherSuggestions: string[]];
type FlagWordWithSuggestionsObj = Record<string, string | string[]>;
type FlagWordWithSuggestions = FlagWordWithSuggestionsArray | FlagWordWithSuggestionsObj;
type FlagWord = FlagWordNoSuggestions | FlagWordWithSuggestions;
export type FlagWords = FlagWord[];

// Changes to BaseSettings:
export interface NewBaseSettings extends Omit<BaseSetting, 'flagWords'> {
    flagWords?: FlagWords;
}

// cspell:ignore akcent alusion
const exampleFlagWords: NewBaseSettings = {
    flagWords: ['crap', ['hte', 'the'], { akcent: 'accent' }, { alusion: ['allusion', 'illusion'] }],
};

type TermForbid = false;
type TermIgnore = null;
type TermWord = true;
type TermTypo = string[] | string;

const TermForbid: TermForbid = false;
const TermWord: TermWord = true;
const TermIgnore: TermIgnore = null;

type Term = TermWord | TermForbid | TermIgnore | TermTypo;
type Terms = Record<string, Term>;

// cspell:ignore abondoning abondons aborigene accesories accidant abortificant
const exampleTerms: Terms = {
    crap: TermForbid,
    incase: ['in case'],
    ignoreX: TermIgnore,
    abandoning: TermWord,
    abondoning: ['abandoning'],
    abondons: ['abandons'],
    aborigene: ['aborigine'],
    accesories: ['accessories'],
    accidant: ['accident'],
    abortificant: ['abortifacient'],
};

/*********************/

export const __testing__ = {
    exampleDef,
    exampleFlagWords,
    exampleTerms,
};
