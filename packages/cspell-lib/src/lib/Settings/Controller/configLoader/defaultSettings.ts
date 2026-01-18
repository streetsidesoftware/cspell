import { currentSettingsFileVersion } from '../../constants.js';
import { createCSpellSettingsInternal as csi } from '../../internal/index.js';
import type { CSpellSettingsI } from './types.js';

export const defaultSettings: CSpellSettingsI = csi({
    id: 'default',
    name: 'default',
    version: currentSettingsFileVersion,
});
