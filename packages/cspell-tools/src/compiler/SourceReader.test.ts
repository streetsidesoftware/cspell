import * as path from 'path';

import type { SourceReaderOptions } from './SourceReader';
import { createSourceReader } from './SourceReader';
import { defaultAllowedSplitWords } from './WordsCollection';

const samples = path.join(__dirname, '..', '..', '..', 'Samples', 'dicts');

const readerOptions: SourceReaderOptions = {
    splitWords: false,
    allowedSplitWords: defaultAllowedSplitWords,
};

describe('Validate the iterateWordsFromFile', () => {
    test('streamWordsFromFile: hunspell', async () => {
        const reader = await createSourceReader(path.join(samples, 'hunspell', 'example.aff'), readerOptions);
        const results = [...reader.words];
        // this might break if the processing order of hunspell changes.
        expect(results).toEqual(s('hello rework reworked tried try work worked', ' '));
    });

    test('stream words from trie', async () => {
        const reader = await createSourceReader(path.join(samples, 'cities.trie.gz'), readerOptions);
        const results = [...reader.words];
        expect(results.join('|')).toBe(
            'amsterdam|angeles|city|delhi|francisco|london|los|los angeles' +
                '|mexico|mexico city|new|new amsterdam|new delhi|new york|paris|san|san francisco|york'
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
        const reader = await createSourceReader(path.join(samples, 'cities.trie.gz'), readerOptions);
        const results = [...reader.words];
        expect(results.join('|')).toBe(
            'amsterdam|angeles|city|delhi|francisco|london|los|los angeles' +
                '|mexico|mexico city|new|new amsterdam|new delhi|new york|paris|san|san francisco|york'
        );
    });

    test('annotatedWords: text - cities.txt', async () => {
        const reader = await createSourceReader(path.join(samples, 'cities.txt'), readerOptions);
        const results = [...reader.words];
        // the results are sorted
        expect(results.join('|')).toBe(
            'New York|New Amsterdam|Los Angeles|San Francisco|New Delhi|Mexico City|London|Paris'
        );
    });

    test('annotatedWords: text - sampleCodeDic.txt', async () => {
        const reader = await createSourceReader(path.join(samples, 'sampleCodeDic.txt'), readerOptions);
        const results = [...reader.words];
        // cspell:ignore codecode errorerror codemsg
        // the results are sorted
        expect(results.join('|')).toBe('Error*|+error*|Code*|+code*|*msg|!err|!Errorerror|!Codemsg|Café|!codecode');
    });

    function s(a: string, on: string | RegExp = '|'): string[] {
        return a.split(on);
    }
});
