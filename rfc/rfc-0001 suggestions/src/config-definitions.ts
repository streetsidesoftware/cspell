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
type FlagWordWithSuggestions = [forbidWord: string, suggestion: string, ...otherSuggestions: string[]];
type FlagWord = FlagWordNoSuggestions | FlagWordWithSuggestions;
export type FlagWords = FlagWord[];

// Changes to BaseSettings:
export interface NewBaseSettings extends Omit<BaseSetting, 'flagWords'> {
    flagWords?: FlagWords;
}

const exampleFlagWords: NewBaseSettings = {
    flagWords: ['crap', ['hte', 'the']],
};

/*********************/

export const __testing__ = {
    exampleDef,
    exampleFlagWords,
};
