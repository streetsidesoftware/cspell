import type { DictionaryDefinitionPreferred, BaseSetting } from '@cspell/cspell-types';

export interface DictionaryDefinitionSuggestions extends Omit<DictionaryDefinitionPreferred, 'type'> {
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
