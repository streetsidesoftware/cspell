import 'mocha';

import assert from 'node:assert';

import type { UnknownWordsChoices } from 'cspell-lib';

import type { ReportTypes } from './spellCheck.mjs';
import { type mapReportToUnknownWordChoices, spellCheck, type SpellCheckOptions } from './spellCheck.mjs';

type MapReportToUnknownWordChoicesConst = typeof mapReportToUnknownWordChoices;

type MapReportToUnknownWordChoicesRev = {
    [v in keyof MapReportToUnknownWordChoicesConst as MapReportToUnknownWordChoicesConst[v]]: v;
};
/**
 * This function is just used
 */
function _mapUnknownWordToReportTypes(k: UnknownWordsChoices, map: MapReportToUnknownWordChoicesRev): ReportTypes {
    // This will not compile if A new value was added to UnknownWordsChoices and was not added to mapReportToUnknownWordChoices
    return map[k];
}

const defaultOptions: SpellCheckOptions = {
    numSuggestions: 8,
    generateSuggestions: false,
    autoFix: false,
    cwd: new URL('.', import.meta.url).href,
};

describe('Validate spellCheck', () => {
    it('checks a simple file with no issues.', async () => {
        const text = sampleTextTs();
        const ranges = [textToRange(text)];
        const result = await spellCheck(import.meta.url, text, ranges, { ...defaultOptions });
        assert.deepEqual(result, { issues: [], errors: [] });
    });

    it('checks a simple file with with issues.', async () => {
        // cspell:ignore isssue
        const text = sampleTextTs() + '\n // This is an isssue.\n';
        const ranges = [textToRange(text)];
        const result = await spellCheck(import.meta.url, text, ranges, {
            ...defaultOptions,
        });
        const issueExpected = {
            word: 'isssue',
            start: text.indexOf('isssue'),
            end: text.indexOf('isssue') + 'isssue'.length,
            rangeIdx: 0,
            range: [0, text.length],
            severity: 'Unknown',
            suggestions: [{ isPreferred: true, word: 'issue' }],
        };

        assert.deepEqual(result, { issues: [issueExpected], errors: [] });
    });

    it('checks a simple file with report type - all.', async () => {
        // cspell:ignore isssue
        const text = sampleTextTs() + '\n // This is an isssue.\n';
        const ranges = [textToRange(text)];
        const result = await spellCheck(import.meta.url, text, ranges, {
            ...defaultOptions,
            report: 'all',
        });

        const issueExpected = {
            word: 'isssue',
            start: text.indexOf('isssue'),
            end: text.indexOf('isssue') + 'isssue'.length,
            rangeIdx: 0,
            range: [0, text.length],
            severity: 'Unknown',
            suggestions: [{ isPreferred: true, word: 'issue' }],
        };

        assert.deepEqual(result, { issues: [issueExpected], errors: [] });
    });

    it('checks a simple file with report type - simple.', async () => {
        // cspell:ignore isssue xyzabc
        // 'isssue' is a simple typo (has suggestion), 'xyzabc' is not a simple typo
        const text = sampleTextTs() + '\n // This is an isssue and xyzabc.\n';
        const ranges = [textToRange(text)];
        const result = await spellCheck(import.meta.url, text, ranges, {
            ...defaultOptions,
            report: 'simple',
        });

        const issueExpected = {
            word: 'isssue',
            start: text.indexOf('isssue'),
            end: text.indexOf('isssue') + 'isssue'.length,
            rangeIdx: 0,
            range: [0, text.length],
            severity: 'Unknown',
            suggestions: [{ isPreferred: true, word: 'issue' }],
        };

        assert.deepEqual(result, { issues: [issueExpected], errors: [] });
    });

    it('checks a simple file with report type - typos.', async () => {
        // cspell:ignore isssue xyzabc
        // 'isssue' has a preferred suggestion so it's considered a common typo
        const text = sampleTextTs() + '\n // This is an isssue and xyzabc.\n';
        const ranges = [textToRange(text)];
        const result = await spellCheck(import.meta.url, text, ranges, {
            ...defaultOptions,
            report: 'typos',
        });

        const issueExpected = {
            word: 'isssue',
            start: text.indexOf('isssue'),
            end: text.indexOf('isssue') + 'isssue'.length,
            rangeIdx: 0,
            range: [0, text.length],
            severity: 'Unknown',
            suggestions: [{ isPreferred: true, word: 'issue' }],
        };

        assert.deepEqual(result, { issues: [issueExpected], errors: [] });
    });

    it('checks a simple file with report type - flagged.', async () => {
        const text = sampleTextTs() + '\n // This is an isssue and testFlaggedWord.\n';
        const ranges = [textToRange(text)];
        const result = await spellCheck(import.meta.url, text, ranges, {
            ...defaultOptions,
            report: 'typos',
        });

        const issueExpected = {
            word: 'isssue',
            start: text.indexOf('isssue'),
            end: text.indexOf('isssue') + 'isssue'.length,
            rangeIdx: 0,
            range: [0, text.length],
            severity: 'Unknown',
            suggestions: [{ isPreferred: true, word: 'issue' }],
        };

        assert.deepEqual(result, { issues: [issueExpected], errors: [] });
    });
});

function sampleTextTs(): string {
    return `
function textToRange(text: string, substring?: string): [number, number] {
    if (!substring) {
        return [0, text.length];
    }
    const start = text.indexOf(substring);
    return [start, start + substring.length];
}
`;
}

function textToRange(text: string, substring?: string): [number, number] {
    if (!substring) {
        return [0, text.length];
    }
    const start = text.indexOf(substring);
    if (start === -1) {
        throw new Error(`Substring "${substring}" not found in "${text}"`);
    }
    return [start, start + substring.length];
}
