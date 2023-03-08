import type { CSpellSettingsInternalFinalized } from '../Models/CSpellSettingsInternalDef';
import type { ValidationOptions } from './ValidationTypes';

export function settingsToValidateOptions(settings: CSpellSettingsInternalFinalized): ValidationOptions {
    const opt: ValidationOptions = {
        ...settings,
        ignoreCase: !(settings.caseSensitive ?? false),
    };
    return opt;
}
