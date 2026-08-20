import { AssertionError } from 'node:assert';

import type { CSpellJUnitReporterSettings } from '../CSpellJUnitReporterSettings.js';

/**
 * Throws an error if passed cspell-junit-reporter settings are invalid
 */
export function validateSettings(settings: unknown): asserts settings is CSpellJUnitReporterSettings {
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
        throw new AssertionError({
            message: 'cspell-junit-reporter settings must be an object',
            actual: typeof settings,
            expected: 'object',
        });
    }

    const { outFile = 'stdout', suiteName = 'cspell' } = settings as CSpellJUnitReporterSettings;

    if (typeof outFile !== 'string') {
        throw new AssertionError({
            message: 'cspell-junit-reporter settings.outFile must be a string',
            actual: typeof outFile,
            expected: 'string',
        });
    }

    if (typeof suiteName !== 'string') {
        throw new AssertionError({
            message: 'cspell-junit-reporter settings.suiteName must be a string',
            actual: typeof suiteName,
            expected: 'string',
        });
    }
}
