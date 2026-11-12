import {
    checkFilenameMatchesExcludeGlob,
    checkFilenameMatchesExcludeGlobFilesOnly,
} from '../globs/checkFilenameMatchesGlob.js';
import type { CSpellSettingsI, CSpellSettingsWSTO } from './CSpellSettingsServer.js';
import { mergeSettings, toInternalSettings } from './CSpellSettingsServer.js';

export function calcOverrideSettings(settings: CSpellSettingsWSTO, filename: string): CSpellSettingsI {
    const _settings = toInternalSettings(settings);
    const overrides = _settings.overrides || [];
    const matchesGlob =
        _settings.features?.overrideGlobsMatchFilesOnly === true
            ? checkFilenameMatchesExcludeGlobFilesOnly
            : checkFilenameMatchesExcludeGlob;

    const result = overrides
        .filter((override) => matchesGlob(filename, override.filename))
        .reduce((settings, override) => mergeSettings(settings, override), _settings);
    return result;
}
