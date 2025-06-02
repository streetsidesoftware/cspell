import fs from 'node:fs/promises';

import { toFileDirURL, toFileURL } from '@cspell/url';
import { createReaderWriter, CSpellConfigFile, CSpellConfigFileReaderWriter } from 'cspell-config-lib';

import { addDictionariesToConfigFile, addImportsToConfigFile, setConfigFieldValue } from './adjustConfig.js';
import type { InitOptions } from './options.js';

const schemaRef = 'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/cspell.schema.json';

const defaultConfigJson = `\
{
    "$schema": "${schemaRef}",
    "version": "0.2",
    // The name of the configuration. Use for display purposes only.
    // "name": "CSpell Configuration",
    // The locale to use when spell checking.
    "language": "en",
    // A description of the configuration.
    // "description": "",
    // Configuration or packages to import.
    "import": [],
    // Define user dictionaries.
    "dictionaryDefinitions": [],
    // Enable the dictionaries.
    "dictionaries": [],
    // Glob patterns of files to be skipped.
    "ignorePaths": [],
    // Words to be considered correct.
    "words": [],
    // Words to be ignored
    "ignoreWords": [],
    // Words to be flagged as incorrect.
    "flagWords": [],
    // Set configuration based upon file globs.
    // "overrides": [],
}
`;

const defaultConfigYaml = `\
# yaml-language-server: $schema=${schemaRef}

version: '0.2'

# The name of the configuration. Use for display purposes only.
# "name": "CSpell Configuration"

# The locale to use when spell checking.
language: en

# A description of the configuration.
# description: ''

# Configuration or packages to import.
import: []

# Define user dictionaries.
dictionaryDefinitions: []

# Enable the dictionaries.
dictionaries: []

# Glob patterns of files to be skipped.
ignorePaths: []

# Words to be considered correct.
# words: []

# Words to be ignored.
ignoreWords: []

# Words to be flagged as incorrect.
flagWords: []

# Set configuration based upon file globs.
# overrides: []
`;

export async function configInit(options: InitOptions): Promise<void> {
    console.error('Init %o', options);

    const rw = createReaderWriter();
    const url = determineFileNameURL(options);
    const configFile = await createConfigFile(rw, url, options);
    await applyOptionsToConfigFile(configFile, options);
    await rw.writeConfig(configFile);
}

async function applyOptionsToConfigFile(configFile: CSpellConfigFile, options: InitOptions): Promise<CSpellConfigFile> {
    if (options.locale) {
        setConfigFieldValue(configFile, 'language', options.locale);
    }

    if (options.import) {
        await addImportsToConfigFile(configFile, options.import);
    }

    if (options.dictionary) {
        addDictionariesToConfigFile(configFile, options.dictionary);
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
