import type { CSpellSettingsInternalFinalized } from '../Models/CSpellSettingsInternalDef.js';
import type { ValidationOptions } from './ValidationTypes.js';

export function settingsToValidateOptions(settings: CSpellSettingsInternalFinalized): ValidationOptions {
    const opt: ValidationOptions = {
        ...settings,
        ignoreCase: !(settings.caseSensitive ?? false),
        ignoreRandomStrings: settings.ignoreRandomStrings,
        minRandomLength: settings.minRandomLength,
    };
    return opt;
}
