import { mergeSettings } from '../../CSpellSettingsServer';
import { readSettings } from './readSettings';
import { CSpellSettingsI } from './types';
import { defaultSettings } from './configLoader';

/**
 *
 * @param filenames - settings files to read
 * @returns combined configuration
 * @deprecated true
 */

export function readSettingsFiles(filenames: string[]): CSpellSettingsI {
    return filenames.map((filename) => readSettings(filename)).reduce((a, b) => mergeSettings(a, b), defaultSettings);
}
