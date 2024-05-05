import { pathToFileURL } from 'node:url';

import type { CSpellSettings, CSpellSettingsWithSourceTrace } from '@cspell/cspell-types';
import type { CSpellConfigFile } from 'cspell-config-lib';
import { CSpellConfigFileInMemory, CSpellConfigFileJson } from 'cspell-config-lib';

import { getSourceDirectoryUrl, toFilePathOrHref } from '../util/url.js';
import { GlobalConfigStore } from './cfgStore.js';
import { configToRawSettings } from './Controller/configLoader/configToRawSettings.js';
import type { CSpellSettingsWST } from './Controller/configLoader/types.js';

const globalConfig = new GlobalConfigStore();

export interface GlobalSettingsWithSource extends Partial<GlobalCSpellSettings> {
    source: CSpellSettingsWithSourceTrace['source'];
}

export interface GlobalCSpellSettings extends Required<Pick<CSpellSettings, 'import'>> {}

export async function getRawGlobalSettings(): Promise<CSpellSettingsWST> {
    return configToRawSettings(await getGlobalConfig());
}

export async function getGlobalConfig(): Promise<CSpellConfigFile> {
    const name = 'CSpell Configstore';
    const configPath = getGlobalConfigPath();
    let urlGlobal = configPath ? pathToFileURL(configPath) : new URL('global-config.json', getSourceDirectoryUrl());

    const source: CSpellSettingsWST['source'] = {
        name,
        filename: toFilePathOrHref(urlGlobal),
    };

    const globalConf: GlobalSettingsWithSource = { source };

    let hasGlobalConfig = false;

    const found = await globalConfig.readConfigFile();

    if (found && found.config && found.filename) {
        const cfg = found.config;
        urlGlobal = pathToFileURL(found.filename);

        // Only populate globalConf is there are values.
        if (cfg && Object.keys(cfg).length) {
            Object.assign(globalConf, cfg);
            globalConf.source = {
                name,
                filename: found.filename,
            };
            hasGlobalConfig = Object.keys(cfg).length > 0;
        }
    }

    const settings: CSpellSettingsWST = { ...globalConf, name, source };

    const ConfigFile = hasGlobalConfig ? CSpellConfigFileJson : CSpellConfigFileInMemory;

    return new ConfigFile(urlGlobal, settings);
}

export async function writeRawGlobalSettings(settings: GlobalCSpellSettings): Promise<void> {
    const toWrite: GlobalCSpellSettings = {
        import: settings.import,
    };

    await globalConfig.writeConfigFile(toWrite);
}

export function getGlobalConfigPath(): string | undefined {
    try {
        return globalConfig.location || GlobalConfigStore.defaultLocation;
    } catch {
        return undefined;
    }
}
