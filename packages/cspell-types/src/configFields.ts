import type { CSpellUserSettings } from './CSpellSettingsDef.js';

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
    enabledFileTypes: 'enabledFileTypes',
    enableGlobDot: 'enableGlobDot',
    engines: 'engines',
    failFast: 'failFast',
    features: 'features',
    files: 'files',
    flagWords: 'flagWords',
    gitignoreRoot: 'gitignoreRoot',
    globRoot: 'globRoot',
    ignorePaths: 'ignorePaths',
    ignoreRegExpList: 'ignoreRegExpList',
    ignoreWords: 'ignoreWords',
    ignoreRandomStrings: 'ignoreRandomStrings',
    import: 'import',
    includeRegExpList: 'includeRegExpList',
    language: 'language',
    languageId: 'languageId',
    languageSettings: 'languageSettings',
    loadDefaultConfiguration: 'loadDefaultConfiguration',
    maxDuplicateProblems: 'maxDuplicateProblems',
    maxFileSize: 'maxFileSize',
    maxNumberOfProblems: 'maxNumberOfProblems',
    minWordLength: 'minWordLength',
    minRandomLength: 'minRandomLength',
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
    suggestWords: 'suggestWords',
    unknownWords: 'unknownWords',
    useGitignore: 'useGitignore',
    usePnP: 'usePnP',
    userWords: 'userWords',
    validateDirectives: 'validateDirectives',
    vfs: 'vfs',
    words: 'words',

    // Experimental
    parser: 'parser',
};

// export const ConfigKeysNames = Object.values(ConfigKeysByField);
