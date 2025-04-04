// cSpell:ignore jpegs outing dirs lcode outring outrings

import { toArray } from '@cspell/cspell-pipe/sync';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { ParseFileOptions } from './wordListParser.js';
import { normalizeTargetWords, parseFileLines } from './wordListParser.js';
import { defaultAllowedSplitWords } from './WordsCollection.js';

const alwaysAllowSplit = { size: 10, has: () => true };

describe('Validate the wordListCompiler', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    test.each`
        lines                                       | sort     | expectedResult
        ${'banana|Apple|~apple|Apple|apple'}        | ${true}  | ${'Apple|apple|banana|~apple'}
        ${'banana|Apple|~apple|Apple|apple|banana'} | ${false} | ${'banana|Apple|~apple|apple'}
        ${'hello'}                                  | ${true}  | ${['hello']}
        ${'!Hello'}                                 | ${true}  | ${'!Hello'}
    `('createSortAndFilterOperation $lines $sort', ({ lines, expectedResult, sort }) => {
        const normalizer = normalizeTargetWords({ sort, generateNonStrict: false });
        const r = toArray(normalizer(s(lines)));
        expect(r).toEqual(s(expectedResult));
    });

    test.each`
        lines                                | sort     | expectedResult
        ${'banana|Apple|Apple|apple'}        | ${true}  | ${'Apple|apple|banana|~apple'}
        ${'banana|Apple|Apple|apple|banana'} | ${false} | ${'banana|Apple|~apple|apple'}
        ${'hello'}                           | ${true}  | ${'hello'}
        ${'!Hello'}                          | ${true}  | ${'!Hello|~!hello'}
    `('createSortAndFilterOperation $lines $sort', ({ lines, expectedResult, sort }) => {
        const normalizer = normalizeTargetWords({ sort, generateNonStrict: true });
        const r = toArray(normalizer(s(lines)));
        expect(r).toEqual(s(expectedResult));
    });

    const sampleContent = `
    # cspell-tools: keep-case no-split
    Tower of London
    # cspell-tools: split
    New York
    `;

    test.each`
        content                                                                               | options                 | expectedResult
        ${'Apple|~apple|Apple'}                                                               | ${pf({ legacy: true })} | ${['apple']}
        ${s('Apple|~apple|Apple')}                                                            | ${pf({ legacy: true })} | ${['apple']}
        ${'ArrayObject::getFlags\nArrayObject::getIterator\nArrayObject::getIteratorClass\n'} | ${pf({ legacy: true })} | ${s('array|object|get|flags|iterator|class')}
        ${sampleContent}                                                                      | ${pf()}                 | ${s('Tower of London|New|York')}
        ${'apple\u200Cbanana'}                                                                | ${pf({ split: true })}  | ${['apple', 'banana']}
        ${'apple\u200Cbanana'}                                                                | ${pf({})}               | ${['apple\u200Cbanana']}
        ${'apple\\u200cbanana'}                                                               | ${pf({ split: true })}  | ${s('apple|banana')}
        ${s('apple|xfc|banana|x|u|a')}                                                        | ${pf({ split: true })}  | ${s('apple|xfc|banana|x|u|a')}
    `('createSortAndFilterOperation $content $options', ({ content, options, expectedResult }) => {
        const r = [...parseFileLines(content, options)];
        expect(r).toEqual(expectedResult);
    });

    test.each`
        content         | options                                                                                       | expectedResult
        ${'AppleSauce'} | ${pf({ split: true })}                                                                        | ${s('AppleSauce')}
        ${'AppleSauce'} | ${pf({ split: true, allowedSplitWords: alwaysAllowSplit })}                                   | ${s('apple|sauce')}
        ${'AppleSauce'} | ${pf({ split: true, allowedSplitWords: alwaysAllowSplit, legacy: true })}                     | ${s('apple|sauce')}
        ${'AppleSauce'} | ${pf({ split: true, allowedSplitWords: alwaysAllowSplit, storeSplitWordsAsCompounds: true })} | ${s('apple+|+sauce')}
    `('parseFileLines split $content $options', ({ content, options, expectedResult }) => {
        const r = [...parseFileLines(content, options)];
        expect(r).toEqual(expectedResult);
    });
});

function pf(...opts: Partial<ParseFileOptions>[]): ParseFileOptions {
    const opt: ParseFileOptions = {
        allowedSplitWords: defaultAllowedSplitWords,
        storeSplitWordsAsCompounds: undefined,
        minCompoundLength: undefined,
    };
    for (const op of opts) {
        Object.assign(opt, op);
    }
    return opt;
}

function s(values: string | string[]): string[] {
    return Array.isArray(values) ? values : values.split(/[\n|]/g);
}
