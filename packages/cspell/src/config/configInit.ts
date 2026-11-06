import fs from 'node:fs/promises';

import type { CSpellSettings } from '@cspell/cspell-types';
import { toFileDirURL, toFileURL } from '@cspell/url';
import type { CSpellConfigFile, CSpellConfigFileReaderWriter } from 'cspell-config-lib';
import { createReaderWriter, cspellConfigFileSchema } from 'cspell-config-lib';

import { console } from '../console.js';
import { addDictionariesToConfigFile, addImportsToConfigFile } from './adjustConfig.js';
import { applyValuesToConfigFile } from './config.js';
import type { CommentConfig } from './constants.js';
import { defaultConfig } from './constants.js';
import type { InitOptions } from './options.js';

const schemaRef = cspellConfigFileSchema;

const defaultConfigJson = `\
{
}
`;

const defaultConfigYaml = `
`;

export async function configInit(options: InitOptions): Promise<void> {
    const rw = createReaderWriter();
    const url = determineFileNameURL(options);
    const configFile = await createConfigFile(rw, url);
    await applyOptionsToConfigFile(configFile, options);
    await fs.mkdir(new URL('./', configFile.url), { recursive: true });

    if (options.stdout) {
        console.stdoutChannel.write(rw.serialize(configFile));
    } else {
        await rw.writeConfig(configFile);
    }
}

async function applyOptionsToConfigFile(configFile: CSpellConfigFile, options: InitOptions): Promise<CSpellConfigFile> {
    const settings: CSpellSettings = {};
    const hasSettings = Object.keys(configFile.settings).length > 0;

    const addComments =
        options.comments ||
        (options.comments === undefined && !options.removeComments && !configFile.url.pathname.endsWith('.json'));

    if (options.comments === false) {
        configFile.removeAllComments();
    }

    if (options.schema ?? !hasSettings) {
        configFile.setSchema(schemaRef);
    }

    if (options.locale) {
        settings.language = options.locale;
    }

    const defaults = hasSettings ? withoutDefaultValues(defaultConfig) : defaultConfig;
    applyValuesToConfigFile(configFile, settings, defaults, addComments);

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

function withoutDefaultValues(config: CommentConfig): CommentConfig {
    return Object.fromEntries(Object.entries(config).map(([key, entry]) => [key, { ...entry, value: undefined }]));
}

function determineFileNameURL(options: InitOptions): URL {
    if (options.config) {
        return toFileURL(options.config);
    }
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
        case 'yml': {
            return 'cspell.config.yml';
        }
    }
    throw new Error(`Unsupported format: ${options.format}`);
}

function getDefaultContent(url: URL): string {
    return /\.jsonc?$/.test(url.pathname) ? defaultConfigJson : defaultConfigYaml;
}

async function createConfigFile(rw: CSpellConfigFileReaderWriter, url: URL): Promise<CSpellConfigFile> {
    if (url.pathname.endsWith('package.json')) {
        return rw.readConfig(url);
    }

    const content = await fs.readFile(url, 'utf8').catch(() => getDefaultContent(url));

    return rw.parse({ url, content });
}
