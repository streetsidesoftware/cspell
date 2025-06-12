import 'mocha';

import assert from 'node:assert';

import { spellCheck, type SpellCheckOptions } from './spellCheck.mjs';

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
