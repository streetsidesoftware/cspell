import type { CSpellSettings } from '@cspell/cspell-types';

export const defaultConfig: CommentConfig = {
    $schema: { value: undefined, comment: ' The schema for the configuration file.' },
    version: { value: '0.2', comment: ' The version of the configuration file format.' },
    name: { value: undefined, comment: ' The name of the configuration. Use for display purposes only.' },
    description: { value: undefined, comment: ' A description of the configuration.' },
    language: { value: 'en', comment: ' The locale to use when spell checking. (e.g., en, en-GB, de-DE' },
    import: { value: undefined, comment: ' Configuration or packages to import.' },
    dictionaryDefinitions: { value: undefined, comment: ' Define user dictionaries.' },
    dictionaries: { value: undefined, comment: ' Enable the dictionaries.' },
    ignorePaths: { value: undefined, comment: ' Glob patterns of files to be skipped.' },
    files: { value: undefined, comment: ' Glob patterns of files to be included.' },
    words: { value: undefined, comment: ' Words to be considered correct.' },
    ignoreWords: { value: undefined, comment: ' Words to be ignored.' },
    flagWords: { value: undefined, comment: ' Words to be flagged as incorrect.' },
    overrides: { value: undefined, comment: ' Set configuration based upon file globs.' },
    languageSettings: { value: undefined, comment: ' Define language specific settings.' },
    enabledFileTypes: { value: undefined, comment: ' Enable for specific file types.' },
    caseSensitive: { value: undefined, comment: ' Enable case sensitive spell checking.' },
    patterns: { value: undefined, comment: ' Regular expression patterns.' },
    ignoreRegExpList: { value: undefined, comment: ' Regular expressions / patterns of text to be ignored.' },
    includeRegExpList: { value: undefined, comment: ' Regular expressions / patterns of text to be included.' },
};

export interface ConfigEntry<T, K extends keyof T> {
    key?: K;
    value: T[K];
    comment?: string;
}

export interface ApplyToConfigEntry<T, K extends keyof T> extends ConfigEntry<T, K> {
    update?: (prev: T[K], next: T[K]) => T[K];
}

export type CommentConfig = {
    [K in keyof CSpellSettings]?: ConfigEntry<CSpellSettings, K>;
};

export type ApplyToConfig<T = CSpellSettings> = {
    [K in keyof T]?: ApplyToConfigEntry<T, K>;
};
