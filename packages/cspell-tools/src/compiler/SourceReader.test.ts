import * as path from 'path';
import { describe, expect, test } from 'vitest';

import { createTestHelper } from '../test/TestHelper.js';
import type { SourceReaderOptions } from './SourceReader.js';
import { createSourceReader } from './SourceReader.js';
import { defaultAllowedSplitWords } from './WordsCollection.js';

const helper = createTestHelper(import.meta.url);

const samples = helper.resolveSample('dicts');

const readerOptions: SourceReaderOptions = {
    splitWords: false,
    allowedSplitWords: defaultAllowedSplitWords,
};

describe('Validate the iterateWordsFromFile', () => {
    test('streamWordsFromFile: hunspell', async () => {
        const reader = await createSourceReader(sample('hunspell/example.aff'), readerOptions);
        const results = [...reader.words];
        // this might break if the processing order of hunspell changes.
        expect(results).toEqual(s('hello rework reworked tried try work worked', ' '));
    });

    test('streamWordsFromFile: hunspell split', async () => {
        const reader = await createSourceReader(fixture('build-split-source/src/color-pairs.dic'), {
            ...readerOptions,
            splitWords: true,
            legacy: true,
        });
        const results = [...reader.words];
        // this might break if the processing order of hunspell changes.
        expect(results).toEqual(
            s('apple banana apple mango apple orange apple pear apple strawberry mango banana', ' '),
        );
    });

    test('stream words from trie', async () => {
        const reader = await createSourceReader(sample('cities.trie.gz'), readerOptions);
        const results = [...reader.words];
        expect(results.join('|')).toBe(
            'amsterdam|angeles|city|delhi|francisco|london|los|los angeles' +
                '|mexico|mexico city|new|new amsterdam|new delhi|new york|paris|san|san francisco|york',
        );
    });

    test.each`
        file                      | options                  | expected
        ${'cities.txt'}           | ${{ splitWords: false }} | ${'New York|New Amsterdam|Los Angeles|San Francisco|New Delhi|Mexico City|London|Paris'}
        ${'cities.txt'}           | ${{ splitWords: true }}  | ${'New|York|Amsterdam|Los|Angeles|San|Francisco|Delhi|Mexico|City|London|Paris'}
        ${'cities.txt'}           | ${{ legacy: true }}      | ${'new|york|amsterdam|los|angeles|san|francisco|delhi|mexico|city|london|paris'}
        ${'hunspell/example.aff'} | ${{}}                    | ${'hello|rework|reworked|tried|try|work|worked'}
    `('stream words from text $file $options', async ({ file, options, expected }) => {
        const reader = await createSourceReader(path.resolve(samples, file), options);
        const results = [...reader.words];
        expect(results.join('|')).toBe(expected);
    });

    test('annotatedWords: trie', async () => {
        const reader = await createSourceReader(sample('cities.trie.gz'), readerOptions);
        const results = [...reader.words];
        expect(results.join('|')).toBe(
            'amsterdam|angeles|city|delhi|francisco|london|los|los angeles' +
                '|mexico|mexico city|new|new amsterdam|new delhi|new york|paris|san|san francisco|york',
        );
    });

    test('annotatedWords: text - cities.txt', async () => {
        const reader = await createSourceReader(sample('cities.txt'), readerOptions);
        const results = [...reader.words];
        // the results are sorted
        expect(results.join('|')).toBe(
            'New York|New Amsterdam|Los Angeles|San Francisco|New Delhi|Mexico City|London|Paris',
        );
    });

    test('annotatedWords: text - sampleCodeDic.txt', async () => {
        const reader = await createSourceReader(sample('sampleCodeDic.txt'), readerOptions);
        const results = [...reader.words];
        // cspell:ignore codecode errorerror codemsg
        // the results are sorted
        expect(results.join('|')).toBe('Error*|+error*|Code*|+code*|*msg|!err|!Errorerror|!Codemsg|Café|!codecode');
    });

    function s(a: string, on: string | RegExp = '|'): string[] {
        return a.split(on);
    }
});

function sample(...parts: string[]): string {
    return helper.resolveSample('dicts', ...parts);
}

function fixture(...parts: string[]): string {
    return helper.resolveFixture(...parts);
}
