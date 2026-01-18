import type { CSpellSettingsInternalFinalized } from '../Settings/index.js';
import type { ValidationOptions } from './ValidationTypes.js';

export function settingsToValidateOptions(settings: CSpellSettingsInternalFinalized): ValidationOptions {
    const opt: ValidationOptions = {
        ...settings,
        ignoreCase: !(settings.caseSensitive ?? false),
        ignoreRandomStrings: settings.ignoreRandomStrings,
        minRandomLength: settings.minRandomLength,
        unknownWords: settings.unknownWords || 'report-all',
    };
    return opt;
}
