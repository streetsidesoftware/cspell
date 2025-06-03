import fs from 'node:fs/promises';

import type { CSpellSettings } from '@cspell/cspell-types';
import { toFileDirURL, toFileURL } from '@cspell/url';
import {
    createReaderWriter,
    CSpellConfigFile,
    CSpellConfigFileReaderWriter,
    cspellConfigFileSchema,
} from 'cspell-config-lib';

import { addDictionariesToConfigFile, addImportsToConfigFile, setConfigFieldValue } from './adjustConfig.js';
import type { InitOptions } from './options.js';

const schemaRef = cspellConfigFileSchema;

const defaultConfig: CommentConfig = {
    $schema: { value: undefined, comment: ' The schema for the configuration file.' },
    version: { value: '0.2', comment: ' The version of the configuration file format.' },
    name: { value: undefined, comment: ' The name of the configuration. Use for display purposes only.' },
    description: { value: undefined, comment: ' A description of the configuration.' },
    language: { value: 'en', comment: ' The locale to use when spell checking.' },
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
    caseSensitive: { value: false, comment: ' Enable case sensitive spell checking.' },
    patterns: { value: undefined, comment: ' Regular expression patterns.' },
    ignoreRegExpList: { value: undefined, comment: ' Regular expressions / patterns of text to be ignored.' },
    includeRegExpList: { value: undefined, comment: ' Regular expressions / patterns of text to be included.' },
};

const defaultConfigJson = `\
{
}
`;

const defaultConfigYaml = `\
# The version of the configuration file format.
version: '0.2'
`;

export async function configInit(options: InitOptions): Promise<void> {
    console.error('Init %o', options);

    const rw = createReaderWriter();
    const url = determineFileNameURL(options);
    const configFile = await createConfigFile(rw, url, options);
    await applyOptionsToConfigFile(configFile, options);
    await fs.mkdir(new URL('./', configFile.url), { recursive: true });
    await rw.writeConfig(configFile);
}

async function applyOptionsToConfigFile(configFile: CSpellConfigFile, options: InitOptions): Promise<CSpellConfigFile> {
    const settings: CSpellSettings = {};

    const addComments = options.comments !== false;

    if (options.comments === false) {
        configFile.removeAllComments();
    }

    if (options.schema ?? true) {
        configFile.setSchema(schemaRef);
    }

    if (options.locale) {
        settings.language = options.locale;
    }

    applyValuesToConfigFile(configFile, settings, defaultConfig, addComments);

    if (options.import) {
        await addImportsToConfigFile(
            configFile,
            options.import,
            (addComments && defaultConfig.import?.comment) || undefined,
        );
    }

    if (options.dictionary) {
        addDictionariesToConfigFile(
            configFile,
            options.dictionary,
            (addComments && defaultConfig.dictionaries?.comment) || undefined,
        );
    }

    return configFile;
}

function determineFileNameURL(options: InitOptions): URL {
    const defaultFileName = determineDefaultFileName(options);
    const outputUrl = toFileURL(options.output || defaultFileName);
    const path = outputUrl.pathname;
    if (path.endsWith('.json') || path.endsWith('.jsonc') || path.endsWith('.yaml') || path.endsWith('.yml')) {
        return outputUrl;
    }
    if (/\.{m,c}?{j,t}s$/.test(path)) {
        throw new Error(`Unsupported file extension: ${path}`);
    }
    return new URL(defaultFileName, toFileDirURL(outputUrl));
}

function determineDefaultFileName(options: InitOptions): string {
    switch (options.format || 'yaml') {
        case 'json': {
            return 'cspell.json';
        }
        case 'jsonc': {
            return 'cspell.jsonc';
        }
        case 'yaml': {
            return 'cspell.config.yaml';
        }
    }
    throw new Error(`Unsupported format: ${options.format}`);
}

function getDefaultContent(options: InitOptions): string {
    switch (options.format) {
        case undefined:
        case 'yaml': {
            return defaultConfigYaml;
        }
        case 'json':
        case 'jsonc': {
            return defaultConfigJson;
        }
        default: {
            throw new Error(`Unsupported format: ${options.format}`);
        }
    }
}

async function createConfigFile(
    rw: CSpellConfigFileReaderWriter,
    url: URL,
    options: InitOptions,
): Promise<CSpellConfigFile> {
    if (url.pathname.endsWith('package.json')) {
        return rw.readConfig(url);
    }

    const content = await fs.readFile(url, 'utf8').catch(() => getDefaultContent(options));

    return rw.parse({ url, content });
}

interface ConfigEntry<T, K extends keyof T> {
    key?: K;
    value: T[K];
    comment?: string;
}

type CommentConfig = {
    [K in keyof CSpellSettings]?: ConfigEntry<CSpellSettings, K>;
};

function applyValuesToConfigFile(
    config: CSpellConfigFile,
    settings: CSpellSettings,
    defaultValues: CommentConfig,
    addComments: boolean,
): CSpellConfigFile {
    const currentSettings = config.settings || {};
    for (const [k, entry] of Object.entries(defaultValues)) {
        const { value: defaultValue, comment } = entry;
        const key = k as keyof CSpellSettings;
        const newValue = settings[key];
        const oldValue = currentSettings[key];
        const value = newValue ?? oldValue ?? defaultValue;
        if ((newValue === undefined && oldValue !== undefined) || value === undefined) {
            continue;
        }
        const useComment = (addComments && oldValue === undefined && comment) || undefined;
        setConfigFieldValue(config, key, value, useComment);
    }
    return config;
}
