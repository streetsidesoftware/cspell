import { describe, expect, test } from 'vitest';

import { validateSettings } from './validateSettings.js';

describe('validateSettings', () => {
    test('accepts an empty object', () => {
        expect(() => validateSettings({})).not.toThrow();
    });

    test('accepts valid settings', () => {
        expect(() => validateSettings({ outFile: 'out.xml', suiteName: 'my-suite' })).not.toThrow();
    });

    test('throws for non-object settings', () => {
        expect(() => validateSettings('nope')).toThrowErrorMatchingSnapshot();
    });

    test('throws for array settings', () => {
        expect(() => validateSettings([])).toThrowErrorMatchingSnapshot();
    });

    test('throws for invalid outFile', () => {
        expect(() => validateSettings({ outFile: 123 })).toThrowErrorMatchingSnapshot();
    });

    test('throws for invalid suiteName', () => {
        expect(() => validateSettings({ suiteName: 123 })).toThrowErrorMatchingSnapshot();
    });
});
