import { toFilePathOrHref } from '@cspell/url';
import type { CSpellUserSettings } from 'cspell-lib';
import * as cspell from 'cspell-lib';

import { environmentKeys, getEnvironmentVariable } from '../environment.js';
import type { CSpellConfigFile } from '../options.js';
import { filenameToUrl } from './fileHelper.js';

export interface ConfigInfo {
    source: string;
    config: CSpellUserSettings;
    /**
     * The config file that was loaded. Not set when there is none.
     */
    url?: URL | undefined;
    /**
     * The config file was found by searching, rather than given or taken from `CSPELL_DEFAULT_CONFIG_PATH`.
     */
    foundBySearch: boolean;
}

export interface FileConfigInfo {
    configInfo: ConfigInfo;
    filename: string;
    text: string;
    languageIds: string[];
}

export async function readConfig(
    configFile: string | CSpellConfigFile | undefined,
    root: string | undefined,
    stopConfigSearchAt?: URL[] | undefined,
): Promise<ConfigInfo> {
    configFile ??= getEnvironmentVariable(environmentKeys.CSPELL_CONFIG_PATH);

    if (configFile) {
        const cfgFile = typeof configFile === 'string' ? await readConfigHandleError(configFile) : configFile;
        return configFileToConfigInfo(cfgFile);
    }
    const config = await cspell.searchForConfig(root, { stopSearchAt: stopConfigSearchAt });

    const defaultConfigFile = getEnvironmentVariable(environmentKeys.CSPELL_DEFAULT_CONFIG_PATH);
    if (!config && defaultConfigFile) {
        const cfgFile = await readConfigFile(defaultConfigFile).catch(() => undefined);
        if (cfgFile) {
            return configFileToConfigInfo(cfgFile);
        }
    }

    const filename = config?.__importRef?.filename;
    return {
        source: filename || 'None found',
        config: config || {},
        url: filename ? filenameToUrl(filename) : undefined,
        foundBySearch: !!config,
    };
}

async function configFileToConfigInfo(cfgFile: CSpellConfigFile): Promise<ConfigInfo> {
    const config = await cspell.resolveConfigFileImports(cfgFile);
    const source = toFilePathOrHref(cfgFile.url);
    return { source, config, url: cfgFile.url, foundBySearch: false };
}

export function readConfigFile(filename: string | URL): Promise<CSpellConfigFile> {
    return cspell.readConfigFile(filename);
}

async function readConfigHandleError(filename: string | URL): Promise<CSpellConfigFile> {
    try {
        return await readConfigFile(filename);
    } catch (e) {
        const settings: cspell.CSpellSettingsWithSourceTrace = {
            __importRef: {
                filename: filename.toString(),
                error: e as Error,
            },
        };
        return { url: filenameToUrl(filename), settings };
    }
}
