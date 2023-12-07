import type { CSpellSettings, CSpellSettingsWithSourceTrace } from '@cspell/cspell-types';
import type { CSpellConfigFile } from 'cspell-config-lib';
import { CSpellConfigFileInMemory, CSpellConfigFileJson } from 'cspell-config-lib';
import { pathToFileURL } from 'url';

import { isErrnoException } from '../util/errors.js';
import { logError } from '../util/logger.js';
import { getSourceDirectoryUrl, toFilePathOrHref } from '../util/url.js';
import { ConfigStore } from './cfgStore.js';
import { configToRawSettings } from './Controller/configLoader/configToRawSettings.js';
import type { CSpellSettingsWST } from './Controller/configLoader/types.js';

const packageName = 'cspell';

export interface GlobalSettingsWithSource extends Partial<GlobalCSpellSettings> {
    source: CSpellSettingsWithSourceTrace['source'];
}

export interface GlobalCSpellSettings extends Required<Pick<CSpellSettings, 'import'>> {}

export async function getRawGlobalSettings(): Promise<CSpellSettingsWST> {
    return configToRawSettings(await getGlobalConfig());
}

export function getGlobalConfig(): Promise<CSpellConfigFile> {
    const name = 'CSpell Configstore';
    const configPath = getGlobalConfigPath();
    const urlGlobal = configPath ? pathToFileURL(configPath) : new URL('global-config.json', getSourceDirectoryUrl());

    const source: CSpellSettingsWST['source'] = {
        name,
        filename: toFilePathOrHref(urlGlobal),
    };

    const globalConf: GlobalSettingsWithSource = { source };

    let hasGlobalConfig = false;

    try {
        const cfgStore = new ConfigStore(packageName);

        const cfg = cfgStore.all;

        // Only populate globalConf is there are values.
        if (cfg && Object.keys(cfg).length) {
            Object.assign(globalConf, cfg);
            globalConf.source = {
                name,
                filename: cfgStore.path,
            };
            hasGlobalConfig = Object.keys(cfg).length > 0;
        }
    } catch (error) {
        if (
            !isErrnoException(error) ||
            !error.code ||
            !['ENOENT', 'EACCES', 'ENOTDIR', 'EISDIR'].includes(error.code)
        ) {
            logError(error);
        }
    }

    const settings: CSpellSettingsWST = { ...globalConf, name, source };

    const ConfigFile = hasGlobalConfig ? CSpellConfigFileJson : CSpellConfigFileInMemory;

    return Promise.resolve(new ConfigFile(urlGlobal, settings));
}

export async function writeRawGlobalSettings(settings: GlobalCSpellSettings): Promise<void> {
    const toWrite: GlobalCSpellSettings = {
        import: settings.import,
    };

    const cfgStore = new ConfigStore(packageName);
    cfgStore.set(toWrite);
}

export function getGlobalConfigPath(): string | undefined {
    try {
        const cfgStore = new ConfigStore(packageName);
        return cfgStore.path;
    } catch (e) {
        return undefined;
    }
}
