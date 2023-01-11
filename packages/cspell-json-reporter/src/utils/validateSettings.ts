import { AssertionError } from 'assert';
import type { CSpellJSONReporterSettings } from '../CSpellJSONReporterSettings';

function assertBooleanOrUndefined(key: string, value: unknown): asserts value is boolean | undefined {
    if (typeof value !== 'boolean' && value !== undefined) {
        throw new AssertionError({
            message: `cspell-json-reporter settings.${key} must be a boolean`,
            actual: typeof value,
            expected: 'boolean',
        });
    }
}

/**
 * Throws an error if passed cspell-json-reporter settings are invalid
 */
export function validateSettings(settings: unknown): asserts settings is CSpellJSONReporterSettings {
    if (!settings || typeof settings !== 'object') {
        throw new AssertionError({
            message: 'cspell-json-reporter settings must be an object',
            actual: typeof settings,
            expected: 'object',
        });
    }

    const { outFile, debug, verbose, progress } = settings as CSpellJSONReporterSettings;

    if (typeof outFile !== 'string') {
        throw new AssertionError({
            message: 'cspell-json-reporter settings.outFile must be a string',
            actual: typeof outFile,
            expected: 'string',
        });
    }

    assertBooleanOrUndefined('verbose', verbose);
    assertBooleanOrUndefined('debug', debug);
    assertBooleanOrUndefined('progress', progress);
}
