import * as path from 'path';
import { describe, expect, test } from 'vitest';

import { test_dirname } from '../test/TestHelper.js';
import { streamSourceWordsFromFile } from './streamSourceWordsFromFile.js';
import { defaultAllowedSplitWords } from './WordsCollection.js';

const _dirname = test_dirname(import.meta.url);

const samples = path.join(_dirname, '../../../Samples/dicts');

const allowedSplitWords = defaultAllowedSplitWords;

describe('Validate the iterateWordsFromFile', () => {
    test('streamWordsFromFile: hunspell', async () => {
        const reader = await streamSourceWordsFromFile(path.join(samples, 'hunspell/example.aff'), {
            splitWords: false,
            allowedSplitWords,
        });
        const results = [...reader];
        // this might break if the processing order of hunspell changes.
        expect(results.join(' ')).toBe('hello rework reworked tried try work worked');
    });

    test('stream words from trie', async () => {
        const reader = await streamSourceWordsFromFile(path.join(samples, 'cities.trie.gz'), {
            splitWords: false,
            allowedSplitWords,
        });
        const results = [...reader];
        expect(results.join('|')).toBe(
            'amsterdam|angeles|city|delhi|francisco|london|los|los angeles' +
                '|mexico|mexico city|new|new amsterdam|new delhi|new york|paris|san|san francisco|york',
        );
    });
});
