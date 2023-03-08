import { mergeSettings } from '../../CSpellSettingsServer.js';
import { defaultSettings } from './defaultSettings.js';
import { readSettings } from './readSettings.js';
import type { CSpellSettingsI } from './types.js';

/**
 *
 * @param filenames - settings files to read
 * @returns combined configuration
 * @deprecated true
 */

export function readSettingsFiles(filenames: string[]): CSpellSettingsI {
    return filenames.map((filename) => readSettings(filename)).reduce((a, b) => mergeSettings(a, b), defaultSettings);
}
