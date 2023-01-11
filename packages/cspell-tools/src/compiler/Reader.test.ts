import * as path from 'path';

import type { ReaderOptions } from './Reader';
import { createReader } from './Reader';

const samples = path.join(__dirname, '..', '..', '..', 'Samples', 'dicts');

const readerOptions: ReaderOptions = {
    splitWords: false,
};

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
                '|mexico|mexico city|new|new amsterdam|new delhi|new york|paris|san|san francisco|york'
        );
    });

    test.each`
        file                      | options                  | expected
        ${'cities.txt'}           | ${{ splitWords: false }} | ${'New York|New Amsterdam|Los Angeles|San Francisco|New Delhi|Mexico City|London|Paris'}
        ${'cities.txt'}           | ${{ splitWords: true }}  | ${'New|York|Amsterdam|Los|Angeles|San|Francisco|Delhi|Mexico|City|London|Paris'}
        ${'cities.txt'}           | ${{ legacy: true }}      | ${'new york|new|york|new amsterdam|amsterdam|los angeles|los|angeles|san francisco|san|francisco|new delhi|delhi|mexico city|mexico|city|london|paris'}
        ${'hunspell/example.aff'} | ${{}}                    | ${'hello|rework|reworked|tried|try|work|worked'}
    `('stream words from text', async ({ file, options, expected }) => {
        const reader = await createReader(path.resolve(samples, file), options);
        const results = [...reader];
        expect(results.join('|')).toBe(expected);
    });

    test('annotatedWords: trie', async () => {
        const reader = await createReader(path.join(samples, 'cities.trie.gz'), readerOptions);
        const results = [...reader.words];
        expect(results.join('|')).toBe(
            'amsterdam|angeles|city|delhi|francisco|london|los|los angeles' +
                '|mexico|mexico city|new|new amsterdam|new delhi|new york|paris|san|san francisco|york'
        );
    });

    test('annotatedWords: text - cities.txt', async () => {
        const reader = await createReader(path.join(samples, 'cities.txt'), readerOptions);
        const results = [...reader.words];
        // the results are sorted
        expect(results.join('|')).toBe(
            'New York|New Amsterdam|Los Angeles|San Francisco|New Delhi|Mexico City|London|Paris'
        );
    });

    test('annotatedWords: text - sampleCodeDic.txt', async () => {
        const reader = await createReader(path.join(samples, 'sampleCodeDic.txt'), readerOptions);
        const results = [...reader.words];
        // cspell:ignore codecode errorerror codemsg
        // the results are sorted
        expect(results.join('|')).toBe('Error*|+error*|Code*|+code*|*msg|!err|!Errorerror|!Codemsg|Café|!codecode');
    });

    function s(a: string, on: string | RegExp = '|'): string[] {
        return a.split(on);
    }
});
