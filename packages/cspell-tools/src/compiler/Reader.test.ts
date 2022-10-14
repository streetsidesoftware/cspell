import { createReader, ReaderOptions, __testing__ } from './Reader';
import { pipe, opTake, opFilter } from '@cspell/cspell-pipe/sync';
import * as path from 'path';

const samples = path.join(__dirname, '..', '..', '..', 'Samples', 'dicts');

const readOptionsAdjustCase: ReaderOptions = {
    splitWords: false,
    generateNonStrictAlternatives: true,
};

const readOptionsKeepCase: ReaderOptions = {
    splitWords: false,
    generateNonStrictAlternatives: false,
};

describe('Validate the iterateWordsFromFile', () => {
    const pReaderDutch = createReader(path.join(samples, 'hunspell', 'Dutch.aff'), readOptionsAdjustCase);

    test('streamWordsFromFile: hunspell', async () => {
        const reader = await createReader(path.join(samples, 'hunspell', 'example.aff'), readOptionsAdjustCase);
        expect(reader.size).toBe(3);
        const results = [...reader];
        // this might break if the processing order of hunspell changes.
        expect(results.join(' ')).toBe(
            'hello rework reworked tried try work worked ~hello ~rework ~reworked ~tried ~try ~work ~worked'
        );
    });

    test('stream words from trie', async () => {
        const reader = await createReader(path.join(samples, 'cities.trie.gz'), readOptionsAdjustCase);
        expect(reader.size).toBeGreaterThan(1);
        const results = [...reader];
        expect(results.join('|')).toBe(
            'amsterdam|angeles|city|delhi|francisco|london|los|los angeles' +
                '|mexico|mexico city|new|new amsterdam|new delhi|new york|paris|san|san francisco|york'
        );
    });

    test('stream words from text', async () => {
        const reader = await createReader(path.join(samples, 'cities.txt'), readOptionsKeepCase);
        expect(reader.size).toBeGreaterThan(1);
        const results = [...reader];
        expect(results.join('|')).toBe(
            'London|Los Angeles|Mexico City|New Amsterdam|New Delhi|New York|Paris|San Francisco'
        );
    });

    test('annotatedWords: hunspell', async () => {
        const reader = await createReader(path.join(samples, 'hunspell', 'example.aff'), readOptionsAdjustCase);
        expect(reader.size).toBe(3);
        const results = [...reader.words];
        // this might break if the processing order of hunspell changes.
        expect(results).toEqual(
            ('hello tried try rework reworked work worked ' + '~hello ~tried ~try ~rework ~reworked ~work ~worked')
                .split(' ')
                .sort()
        );
    });

    test('annotatedWords: hunspell Dutch', async () => {
        const reader = await pReaderDutch;
        expect(reader.size).toBe(180689);
        const regBoek = /^.?boek\b/; // cspell:ignore fiets koopman doek boek
        const results = [
            ...pipe(
                reader.words,
                opFilter((word) => regBoek.test(word)),
                opTake(8)
            ),
        ];
        expect(results.join(' ')).toBe('+boek boek boek+ ~boek ~boek+ boek ~boek');
    });

    test('annotatedWords: trie', async () => {
        const reader = await createReader(path.join(samples, 'cities.trie.gz'), readOptionsAdjustCase);
        expect(reader.size).toBeGreaterThan(1);
        const results = [...reader.words];
        expect(results.join('|')).toBe(
            'amsterdam|angeles|city|delhi|francisco|london|los|los angeles' +
                '|mexico|mexico city|new|new amsterdam|new delhi|new york|paris|san|san francisco|york'
        );
    });

    test('annotatedWords: text - cities.txt', async () => {
        const reader = await createReader(path.join(samples, 'cities.txt'), readOptionsAdjustCase);
        expect(reader.size).toBeGreaterThan(1);
        const results = [...reader.words];
        // the results are sorted
        expect(results.join('|')).toBe(
            'London|Los Angeles|Mexico City|New Amsterdam|New Delhi|New York|Paris|San Francisco' +
                '|~london|~los angeles|~mexico city|~new amsterdam|~new delhi|~new york|~paris|~san francisco'
        );
    });

    test('annotatedWords: text - sampleCodeDic.txt', async () => {
        const reader = await createReader(path.join(samples, 'sampleCodeDic.txt'), readOptionsAdjustCase);
        expect(reader.size).toBeGreaterThan(1);
        const results = [...reader.words];
        // cspell:ignore codecode errorerror codemsg
        // the results are sorted
        expect(results.join('|')).toBe(
            '!Codemsg|!Errorerror|!codecode|!err|+code|+code+|+error|+error+|+msg|Café|Code|Code+|Error|Error+|msg' +
                '|~cafe|~café|~code|~code+|~error|~error+'
        );
    });

    function s(a: string, on: string | RegExp = '|'): string[] {
        return a.split(on);
    }

    test.each`
        words                         | expected
        ${s('hello')}                 | ${s('hello|~hello')}
        ${s('café')}                  | ${s('café|~cafe')}
        ${s('café'.normalize('NFD'))} | ${s('café|~cafe')}
    `('_stripCaseAndAccents $words', ({ words, expected }) => {
        const r = [...__testing__._stripCaseAndAccents(words)];
        expect(r).toEqual(expected);
    });
});
