import type { CSpellSettingsInternalFinalized } from '../Settings/index.js';
import type { ValidationOptions } from './ValidationTypes.js';

type RequiredKeys<T> = keyof Required<T>;
type RequireKeys<T, K extends RequiredKeys<T> = keyof Required<T>> = { [P in K]-?: T[P] | undefined };

export function settingsToValidateOptions(settings: CSpellSettingsInternalFinalized): ValidationOptions {
    const opt: RequireKeys<ValidationOptions> = {
        allowCompoundWords: settings.allowCompoundWords,
        flagWords: settings.flagWords,
        ignoreCase: !(settings.caseSensitive ?? false),
        ignoreRandomStrings: settings.ignoreRandomStrings,
        ignoreRegExpList: settings.ignoreRegExpList,
        includeRegExpList: settings.includeRegExpList,
        maxDuplicateProblems: settings.maxDuplicateProblems,
        maxNumberOfProblems: settings.maxNumberOfProblems,
        minRandomLength: settings.minRandomLength,
        minWordLength: settings.minWordLength,
        numSuggestions: settings.numSuggestions,
        suggestionNumChanges: settings.suggestionNumChanges,
        suggestionsTimeout: settings.suggestionsTimeout,
        unknownWords: settings.unknownWords || 'report-all',
    };
    return opt as ValidationOptions;
}
