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

export async function readSettingsFiles(filenames: string[]): Promise<CSpellSettingsI> {
    const settings = await Promise.all(filenames.map((filename) => readSettings(filename)));
    return settings.reduce((a, b) => mergeSettings(a, b), defaultSettings);
}
