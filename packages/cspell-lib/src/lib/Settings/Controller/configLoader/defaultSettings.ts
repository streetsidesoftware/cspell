import { createCSpellSettingsInternal as csi } from '../../../Models/CSpellSettingsInternalDef';
import { currentSettingsFileVersion } from '../../constants';
import type { CSpellSettingsI } from './types';

export const defaultSettings: CSpellSettingsI = csi({
    id: 'default',
    name: 'default',
    version: currentSettingsFileVersion,
});
