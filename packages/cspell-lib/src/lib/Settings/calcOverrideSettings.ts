import { checkFilenameMatchesExcludeGlob } from '../globs/checkFilenameMatchesGlob.js';
import type { CSpellSettingsI, CSpellSettingsWSTO } from './CSpellSettingsServer.js';
import { mergeSettings, toInternalSettings } from './CSpellSettingsServer.js';

export function calcOverrideSettings(settings: CSpellSettingsWSTO, filename: string): CSpellSettingsI {
    const _settings = toInternalSettings(settings);
    const overrides = _settings.overrides || [];

    const result = overrides
        .filter((override) => checkFilenameMatchesExcludeGlob(filename, override.filename))
        .reduce((settings, override) => mergeSettings(settings, override), _settings);
    return result;
}
