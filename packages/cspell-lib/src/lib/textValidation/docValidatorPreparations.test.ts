import { describe, expect, test, vi } from 'vitest';

import { toInternalSettings } from '../Settings/CSpellSettingsServer.js';
import type { MatchRange } from '../Transform/index.js';
import type { DocumentSettingsPreparations } from './docValidatorPreparations.js';
import { DocumentValidatorPreparations } from './docValidatorPreparations.js';

describe('DocumentValidatorPreparations', () => {
    test('the include ranges are not calculated until they are used', () => {
        const calcIncludeRanges = vi.fn(() => ranges(0, 10));
        const prep = createPrep(calcIncludeRanges);

        expect(calcIncludeRanges).not.toHaveBeenCalled();
        expect(prep.includeRanges).toEqual(ranges(0, 10));
        expect(prep.includeRanges).toBe(prep.includeRanges);
        expect(calcIncludeRanges).toHaveBeenCalledTimes(1);
    });

    test('the segmenter uses the include ranges', () => {
        const calcIncludeRanges = vi.fn(() => ranges(0, 4));
        const prep = createPrep(calcIncludeRanges);

        const segmenter = prep.segmenter;

        expect(calcIncludeRanges).toHaveBeenCalledTimes(1);
        expect(prep.segmenter).toBe(segmenter);
        expect([...segmenter({ text: 'one two', range: [0, 7] })].map((t) => t.text)).toEqual(['one ']);
    });

    test('update replaces the settings and calculates the include ranges again on next use', () => {
        const calcFirst = vi.fn(() => ranges(0, 10));
        const calcSecond = vi.fn(() => ranges(2, 5));
        const prep = createPrep(calcFirst);
        const segmenter = prep.segmenter;

        prep.update(settingsPrep(calcSecond, false));

        expect(prep.shouldCheck).toBe(false);
        expect(calcSecond).not.toHaveBeenCalled();
        expect(prep.includeRanges).toEqual(ranges(2, 5));
        expect(prep.segmenter).not.toBe(segmenter);
        expect(calcFirst).toHaveBeenCalledTimes(1);
        expect(calcSecond).toHaveBeenCalledTimes(1);
    });

    test('update keeps the config', () => {
        const prep = createPrep(() => []);
        const { config, localConfig, localConfigFilepath } = prep;

        prep.update(settingsPrep(() => []));

        expect(prep.config).toBe(config);
        expect(prep.localConfig).toBe(localConfig);
        expect(prep.localConfigFilepath).toBe(localConfigFilepath);
    });
});

function ranges(startPos: number, endPos: number): MatchRange[] {
    return [{ startPos, endPos }];
}

function createPrep(calcIncludeRanges: () => MatchRange[]): DocumentValidatorPreparations {
    const config = toInternalSettings({});
    return new DocumentValidatorPreparations(
        config,
        { words: ['one'] },
        'cspell.json',
        settingsPrep(calcIncludeRanges),
    );
}

function settingsPrep(calcIncludeRanges: () => MatchRange[], shouldCheck = true): DocumentSettingsPreparations {
    // Only `calcIncludeRanges` and `shouldCheck` are used by these tests.
    return { shouldCheck, calcIncludeRanges } as unknown as DocumentSettingsPreparations;
}
