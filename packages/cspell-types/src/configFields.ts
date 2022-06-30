import type { CSpellUserSettings } from './CSpellSettingsDef';

export type ConfigKeys = Exclude<keyof CSpellUserSettings, '$schema' | 'version' | 'id'>;

export type CSpellUserSettingsFields = {
    [key in ConfigKeys]: key;
};

export const ConfigFields: CSpellUserSettingsFields = {
    allowCompoundWords: 'allowCompoundWords',
    cache: 'cache',
    caseSensitive: 'caseSensitive',
    description: 'description',
    dictionaries: 'dictionaries',
    dictionaryDefinitions: 'dictionaryDefinitions',
    enabled: 'enabled',
    enabledLanguageIds: 'enabledLanguageIds',
    enableFiletypes: 'enableFiletypes',
    enableGlobDot: 'enableGlobDot',
    failFast: 'failFast',
    features: 'features',
    files: 'files',
    flagWords: 'flagWords',
    gitignoreRoot: 'gitignoreRoot',
    globRoot: 'globRoot',
    ignorePaths: 'ignorePaths',
    ignoreRegExpList: 'ignoreRegExpList',
    ignoreWords: 'ignoreWords',
    import: 'import',
    includeRegExpList: 'includeRegExpList',
    language: 'language',
    languageId: 'languageId',
    languageSettings: 'languageSettings',
    loadDefaultConfiguration: 'loadDefaultConfiguration',
    maxDuplicateProblems: 'maxDuplicateProblems',
    maxNumberOfProblems: 'maxNumberOfProblems',
    minWordLength: 'minWordLength',
    name: 'name',
    noConfigSearch: 'noConfigSearch',
    noSuggestDictionaries: 'noSuggestDictionaries',
    numSuggestions: 'numSuggestions',
    overrides: 'overrides',
    patterns: 'patterns',
    pnpFiles: 'pnpFiles',
    readonly: 'readonly',
    reporters: 'reporters',
    showStatus: 'showStatus',
    spellCheckDelayMs: 'spellCheckDelayMs',
    suggestionNumChanges: 'suggestionNumChanges',
    suggestionsTimeout: 'suggestionsTimeout',
    useGitignore: 'useGitignore',
    usePnP: 'usePnP',
    userWords: 'userWords',
    words: 'words',

    // Experimental
    parser: 'parser',
};

// export const ConfigKeysNames = Object.values(ConfigKeysByField);
