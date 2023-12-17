import type { CSpellConfigFile } from 'cspell-config-lib';

import { toError } from '../../../util/errors.js';
import type { ResolveFileResult } from '../../../util/resolveFile.js';
import { toFileUrl } from '../../../util/url.js';
import type { IConfigLoader } from './configLoader.js';
import { getDefaultConfigLoaderInternal } from './configLoader.js';
import { configErrorToRawSettings, configToRawSettings } from './configToRawSettings.js';
import type { PnPSettingsOptional } from './PnPSettings.js';
import { defaultPnPSettings } from './PnPSettings.js';
import type { CSpellSettingsI, CSpellSettingsWST } from './types.js';

const gcl = getDefaultConfigLoaderInternal;
/**
 *
 * @param searchFrom the directory / file to start searching from.
 * @param pnpSettings - related to Using Yarn PNP.
 * @returns the resulting settings
 */

export function searchForConfig(
    searchFrom: URL | string | undefined,
    pnpSettings: PnPSettingsOptional = defaultPnPSettings,
): Promise<CSpellSettingsI | undefined> {
    return gcl().searchForConfig(searchFrom, pnpSettings);
}
/**
 * Load a CSpell configuration files.
 * @param file - path or package reference to load.
 * @param pnpSettings - PnP settings
 * @returns normalized CSpellSettings
 */

export async function loadConfig(file: string, pnpSettings?: PnPSettingsOptional): Promise<CSpellSettingsI> {
    return gcl().readSettingsAsync(file, undefined, pnpSettings);
}

export async function readConfigFile(filename: string | URL, relativeTo?: string | URL): Promise<CSpellConfigFile> {
    const result = await gcl().readConfigFile(filename, relativeTo);
    if (result instanceof Error) {
        throw result;
    }
    return result;
}

/**
 * Might throw if the settings have not yet been loaded.
 * @deprecated use {@link getGlobalSettingsAsync} instead.
 */
export function getGlobalSettings(): CSpellSettingsI {
    return gcl().getGlobalSettings();
}

/**
 * Loads and caches the global settings.
 * @returns - global settings
 */
export function getGlobalSettingsAsync(): Promise<CSpellSettingsI> {
    return gcl().getGlobalSettingsAsync();
}

export function getCachedFileSize(): number {
    return cachedFiles().size;
}

export function clearCachedSettingsFiles(): void {
    return gcl().clearCachedSettingsFiles();
}

export function getDefaultConfigLoader(): IConfigLoader {
    return getDefaultConfigLoaderInternal();
}
function cachedFiles() {
    return gcl()._cachedFiles;
}
export async function readRawSettings(filename: string | URL, relativeTo?: string | URL): Promise<CSpellSettingsWST> {
    try {
        const cfg = await readConfigFile(filename, relativeTo);
        return configToRawSettings(cfg);
    } catch (e) {
        return configErrorToRawSettings(toError(e), toFileUrl(filename));
    }
}
