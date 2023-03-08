import { createCSpellSettingsInternal as csi } from '../../../Models/CSpellSettingsInternalDef.js';
import { currentSettingsFileVersion } from '../../constants.js';
import type { CSpellSettingsI } from './types.js';

export const defaultSettings: CSpellSettingsI = csi({
    id: 'default',
    name: 'default',
    version: currentSettingsFileVersion,
});
