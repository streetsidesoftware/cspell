import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { toFileDirURL, toFileURL, urlRelative } from '@cspell/url';
import { createReaderWriter, CSpellConfigFile, CSpellConfigFileReaderWriter } from 'cspell-config-lib';

import { toError } from '../util/errors.js';
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

async function fileExists(url: URL): Promise<boolean> {
    try {
        const stats = await fs.stat(url);
        return stats.isFile();
    } catch (e) {
        const err = toError(e);
        if (err.code === 'ENOENT') return false;
        throw e;
    }
}

async function applyOptionsToConfigFile(configFile: CSpellConfigFile, options: InitOptions): Promise<CSpellConfigFile> {
    const settings = configFile.settings;

    if (options.locale) {
        settings.language = options.locale;
    }

    if (options.import) {
        await resolveImports(configFile, options.import);
    }

    return configFile;
}

async function resolveImports(configFile: CSpellConfigFile, imports: string[]) {
    const fromConfigDir = new URL('./', configFile.url);
    const fromCurrentDir = toFileDirURL('./');
    const require = createRequire(fromConfigDir);

    function isPackageName(name: string): boolean {
        try {
            require.resolve(name, { paths: [fileURLToPath(fromConfigDir)] });
            return true;
        } catch {
            return false;
        }
    }

    const settings = configFile.settings;
    settings.import ??= [];
    const _imports = (settings.import = typeof settings.import === 'string' ? [settings.import] : settings.import);

    for (const imp of imports) {
        const url = new URL(imp, fromCurrentDir);
        if (url.protocol !== 'file:') {
            _imports.push(imp);
            continue;
        }
        if (await fileExists(url)) {
            _imports.push(urlRelative(fromConfigDir, url));
            continue;
        }
        if (isPackageName(imp)) {
            _imports.push(imp);
            continue;
        }
        throw new Error(`Cannot resolve import: ${imp}`);
    }
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

async function createConfigFile(
    rw: CSpellConfigFileReaderWriter,
    url: URL,
    options: InitOptions,
): Promise<CSpellConfigFile> {
    if (url.pathname.endsWith('package.json')) {
        return rw.readConfig(url);
    }

    const stats = await fs.stat(url).catch(() => undefined);
    if (stats) {
        throw new Error(`File already exists: ${url}`);
    }

    switch (options.format) {
        case undefined:
        case 'yaml': {
            return rw.parse({ url, content: defaultConfigYaml });
        }
        case 'json':
        case 'jsonc': {
            return rw.parse({ url, content: defaultConfigJson });
        }
        default: {
            throw new Error(`Unsupported format: ${options.format}`);
        }
    }
}
