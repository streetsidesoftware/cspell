import * as path from 'path';
import { describe, expect, test } from 'vitest';

import { test_dirname } from '../test/TestHelper.js';
import { createReader } from './Reader.js';
import type { ReaderOptions } from './readers/ReaderOptions.js';

const _dirname = test_dirname(import.meta.url);

const samples = path.join(_dirname, '../../../Samples/dicts');

const readerOptions: ReaderOptions = {};

const sc = expect.stringContaining;

describe('Validate the iterateWordsFromFile', () => {
    test('streamWordsFromFile: hunspell', async () => {
        const reader = await createReader(path.join(samples, 'hunspell', 'example.aff'), readerOptions);
        const results = [...reader];
        // this might break if the processing order of hunspell changes.
        expect(results).toEqual(s('hello rework reworked tried try work worked', ' '));
    });

    test('stream words from trie', async () => {
        const reader = await createReader(path.join(samples, 'cities.trie.gz'), readerOptions);
        const results = [...reader];
        expect(results.join('|')).toBe(
            'amsterdam|angeles|city|delhi|francisco|london|los|los angeles' +
                '|mexico|mexico city|new|new amsterdam|new delhi|new york|paris|san|san francisco|york',
        );
    });

    test.each`
        file                      | options                  | expected
        ${'cities.txt'}           | ${{ splitWords: false }} | ${'New York|New Amsterdam|Los Angeles|San Francisco|New Delhi|Mexico City|London|Paris|'}
        ${'cities.txt'}           | ${{ splitWords: true }}  | ${'New York|New Amsterdam|Los Angeles|San Francisco|New Delhi|Mexico City|London|Paris|'}
        ${'cities.txt'}           | ${{ legacy: true }}      | ${'New York|New Amsterdam|Los Angeles|San Francisco|New Delhi|Mexico City|London|Paris|'}
        ${'hunspell/example.aff'} | ${{}}                    | ${'hello|rework|reworked|tried|try|work|worked'}
    `('stream words from text $file $options', async ({ file, options, expected }) => {
        const reader = await createReader(path.resolve(samples, file), options);
        const results = [...reader];
        expect(results.join('|')).toBe(expected);
    });

    test('annotatedWords: trie', async () => {
        const reader = await createReader(path.join(samples, 'cities.trie.gz'), readerOptions);
        const results = [...reader.lines];
        expect(results.join('|')).toBe(
            'amsterdam|angeles|city|delhi|francisco|london|los|los angeles' +
                '|mexico|mexico city|new|new amsterdam|new delhi|new york|paris|san|san francisco|york',
        );
    });

    test('annotatedWords: text - cities.txt', async () => {
        const reader = await createReader(path.join(samples, 'cities.txt'), readerOptions);
        const results = [...reader.lines];
        // the results are sorted
        expect(results.join('|')).toBe(
            'New York|New Amsterdam|Los Angeles|San Francisco|New Delhi|Mexico City|London|Paris|',
        );
    });

    test('annotatedWords: text - sampleCodeDic.txt', async () => {
        const reader = await createReader(path.join(samples, 'sampleCodeDic.txt'), readerOptions);
        const results = [...reader.lines];
        // cspell:ignore codecode errorerror codemsg
        // the results are sorted
        expect(results.join('|')).toEqual(sc('# Sample Dictionary||# It possible'));
    });

    function s(a: string, on: string | RegExp = '|'): string[] {
        return a.split(on);
    }
});
