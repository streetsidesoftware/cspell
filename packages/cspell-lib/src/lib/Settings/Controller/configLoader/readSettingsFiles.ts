import { mergeSettings } from '../../CSpellSettingsServer';
import { defaultSettings } from './defaultSettings';
import { readSettings } from './readSettings';
import type { CSpellSettingsI } from './types';

/**
 *
 * @param filenames - settings files to read
 * @returns combined configuration
 * @deprecated true
 */

export function readSettingsFiles(filenames: string[]): CSpellSettingsI {
    return filenames.map((filename) => readSettings(filename)).reduce((a, b) => mergeSettings(a, b), defaultSettings);
}
