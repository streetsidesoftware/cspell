import { getDefaultConfigLoader } from './configLoader.js';
import type { PnPSettingsOptional } from './PnPSettings.js';
import type { CSpellSettingsI } from './types.js';

/**
 * Read / import a cspell configuration file.
 * @param filename - the path to the file.
 *   Supported types: json, yaml, js, and cjs. ES Modules are not supported.
 *   - absolute path `/absolute/path/to/file`
 *   - relative path `./path/to/file` (relative to the current working directory)
 *   - package `@cspell/dict-typescript/cspell-ext.json`
 */
export function readSettings(filename: string | URL): Promise<CSpellSettingsI>;
export function readSettings(filename: string | URL, pnpSettings: PnPSettingsOptional): Promise<CSpellSettingsI>;
/**
 * Read / import a cspell configuration file.
 * @param filename - the path to the file.
 *   Supported types: json, yaml, js, and cjs. ES Modules are not supported.
 *   - absolute path `/absolute/path/to/file`
 *   - relative path `./path/to/file` (relative to `relativeTo`)
 *   - package `@cspell/dict-typescript/cspell-ext.json` searches for node_modules relative to `relativeTo`
 * @param relativeTo - absolute path to start searching for relative files or node_modules.
 */
export function readSettings(filename: string | URL, relativeTo: string | URL): Promise<CSpellSettingsI>;
export function readSettings(
    filename: string | URL,
    relativeTo: string | URL,
    pnpSettings: PnPSettingsOptional,
): Promise<CSpellSettingsI>;
export function readSettings(
    filename: string | URL,
    relativeToOrPnP?: PnPSettingsOptional | string | URL,
    pnpSettings?: PnPSettingsOptional,
): Promise<CSpellSettingsI> {
    const loader = getDefaultConfigLoader();
    const relativeTo =
        typeof relativeToOrPnP === 'string' || relativeToOrPnP instanceof URL ? relativeToOrPnP : undefined;
    const pnp = pnpSettings
        ? pnpSettings
        : !(typeof relativeToOrPnP === 'string' || relativeToOrPnP instanceof URL)
          ? relativeToOrPnP
          : undefined;
    return loader.readSettingsAsync(filename, relativeTo, pnp);
}
