import { CSpellSettingsInternalFinalized } from '../Models/CSpellSettingsInternalDef';
import { ValidationOptions } from './ValidationTypes';

export function settingsToValidateOptions(settings: CSpellSettingsInternalFinalized): ValidationOptions {
    const opt: ValidationOptions = {
        ...settings,
        ignoreCase: !(settings.caseSensitive ?? false),
    };
    return opt;
}
