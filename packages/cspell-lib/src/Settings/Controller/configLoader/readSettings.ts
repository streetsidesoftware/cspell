import { CSpellSettingsI, CSpellSettingsWST, getDefaultConfigLoader } from './configLoader';

/**
 * Read / import a cspell configuration file.
 * @param filename - the path to the file.
 *   Supported types: json, yaml, js, and cjs. ES Modules are not supported.
 *   - absolute path `/absolute/path/to/file`
 *   - relative path `./path/to/file` (relative to the current working directory)
 *   - package `@cspell/dict-typescript/cspell-ext.json`
 */

export function readSettings(filename: string): CSpellSettingsI;
export function readSettings(filename: string, defaultValues: CSpellSettingsWST): CSpellSettingsI;
/**
 * Read / import a cspell configuration file.
 * @param filename - the path to the file.
 *   Supported types: json, yaml, js, and cjs. ES Modules are not supported.
 *   - absolute path `/absolute/path/to/file`
 *   - relative path `./path/to/file` (relative to `relativeTo`)
 *   - package `@cspell/dict-typescript/cspell-ext.json` searches for node_modules relative to `relativeTo`
 * @param relativeTo - absolute path to start searching for relative files or node_modules.
 */
export function readSettings(filename: string, relativeTo: string): CSpellSettingsI;
export function readSettings(filename: string, relativeTo: string, defaultValues: CSpellSettingsWST): CSpellSettingsI;
export function readSettings(
    filename: string,
    relativeToOrDefault?: CSpellSettingsWST | string,
    defaultValue?: CSpellSettingsWST
): CSpellSettingsI {
    const loader = getDefaultConfigLoader();
    if (typeof relativeToOrDefault !== 'string' || defaultValue === undefined)
        return loader.readSettings(filename, relativeToOrDefault);
    return loader.readSettings(filename, relativeToOrDefault, defaultValue);
}
