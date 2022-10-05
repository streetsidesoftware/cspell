// cSpell:ignore jpegs outing dirs lcode outring outrings

import { opConcatMap, pipe, toArray } from '@cspell/cspell-pipe/sync';
import * as Trie from 'cspell-trie-lib';
import { importTrie, isCircular, iteratorTrieWords, serializeTrie } from 'cspell-trie-lib';
import * as fsp from 'fs-extra';
import { uniqueFilter } from 'hunspell-reader/dist/util';
import * as path from 'path';
import { spyOnConsole } from '../test/console';
import { createTestHelper } from '../test/TestHelper';
import { streamWordsFromFile } from './iterateWordsFromFile';
import { setLogger } from './logger';
import { readTextFile } from './readTextFile';
import { compileTrie, compileWordList, consolidate, __testing__ } from './wordListCompiler';
import { legacyLineToWords } from './wordListParser';

const testHelper = createTestHelper(__filename);

const samples = path.join(testHelper.packageRoot, '../Samples/dicts');
const sampleDictEnUS = path.join(samples, 'hunspell', 'en_US.dic');
const sampleDictEn = path.join(samples, 'en_US.txt');

const wordListHeader = __testing__.wordListHeader;

const { consoleOutput } = spyOnConsole();
setLogger(console.log);

describe('Validate the wordListCompiler', () => {
    let temp = '.';
    beforeEach(() => {
        testHelper.cdToTempDir();
        temp = testHelper.resolveTemp();
        jest.resetAllMocks();
    });

    test('reading and normalizing a file', async () => {
        const source = await streamWordsFromFile(path.join(samples, 'cities.txt'), {});
        const destName = path.join(temp, 'cities.txt');
        await compileWordList(source, destName, {
            skipNormalization: false,
            splitWords: undefined,
            sort: true,
            keepRawCase: false,
            legacy: true,
        });
        const output = await fsp.readFile(destName, 'utf8');
        expect(output).toBe(wordListHeader + '\n' + citiesResultSorted);
        expect(consoleOutput()).toMatchSnapshot();
    });

    test('compiling to a file without split', async () => {
        const source = await streamWordsFromFile(path.join(samples, 'cities.txt'), {});
        const destName = path.join(temp, 'cities2.txt');
        await compileWordList(source, destName, {
            skipNormalization: false,
            splitWords: false,
            sort: true,
            keepRawCase: false,
            legacy: false,
        });
        const output = await fsp.readFile(destName, 'utf8');
        expect(output).toBe(
            wordListHeader +
                '\n' +
                citiesSorted +
                citiesSorted
                    .toLowerCase()
                    .split('\n')
                    .filter((a) => !!a)
                    .map((a) => '~' + a)
                    .join('\n') +
                '\n'
        );
        expect(consoleOutput()).toMatchSnapshot();
    });

    test('tests normalized to a trie', () => {
        const words = citiesResult.split('\n');
        const nWords = toArray(legacyNormalizeWords(words));
        const tWords = [...Trie.iteratorTrieWords(normalizeWordsToTrie(words))];
        expect(tWords.sort()).toEqual([...new Set(nWords.sort())]);
        expect(consoleOutput()).toMatchSnapshot();
    });

    test('reading and normalizing to a trie file', async () => {
        const source = await streamWordsFromFile(path.join(samples, 'cities.txt'), {});
        const destName = path.join(temp, 'cities.trie');
        await compileTrie(source, destName, {
            skipNormalization: false,
            splitWords: undefined,
            keepRawCase: false,
            sort: false,
            legacy: true,
        });
        const srcWords = (await fsp.readFile(destName, 'utf8')).split(/\r?\n/g);
        const node = Trie.importTrie(srcWords);
        const expected = citiesResult
            .split('\n')
            .filter((a) => !!a)
            .sort();
        const words = [...Trie.iteratorTrieWords(node)].sort();
        expect(words).toEqual(expected);
        expect(consoleOutput()).toMatchSnapshot();
    });

    test('reading and normalizing to a trie gz file', async () => {
        const source = await streamWordsFromFile(path.join(samples, 'cities.txt'), {});
        const destName = path.join(temp, 'cities.trie.gz');
        await compileTrie(source, destName, {
            skipNormalization: false,
            splitWords: undefined,
            keepRawCase: false,
            sort: false,
            legacy: true,
        });
        const resultFile = await readTextFile(destName);
        const srcWords = resultFile.split('\n');
        const node = Trie.importTrie(srcWords);
        const expected = citiesResult
            .split('\n')
            .filter((a) => !!a)
            .sort();
        const words = [...Trie.iteratorTrieWords(node)].sort();
        expect(words).toEqual(expected);
        expect(consoleOutput()).toMatchSnapshot();
    });

    test('a simple hunspell dictionary depth 0', async () => {
        const source = await streamWordsFromFile(path.join(samples, 'hunspell', 'example.dic'), {
            maxDepth: 0,
        });
        const destName = path.join(temp, 'example0.txt');
        await compileWordList(source, destName, {
            skipNormalization: false,
            splitWords: undefined,
            sort: true,
            keepRawCase: false,
            legacy: true,
        });
        const output = await fsp.readFile(destName, 'utf8');
        expect(output).toBe(__testing__.wordListHeader + '\n' + 'hello\ntry\nwork\n');
        expect(consoleOutput()).toMatchSnapshot();
    });

    test('a simple hunspell dictionary depth 1', async () => {
        const source = await streamWordsFromFile(path.join(samples, 'hunspell', 'example.dic'), {
            maxDepth: 1,
        });
        const destName = path.join(temp, 'example1.txt');
        await compileWordList(source, destName, {
            skipNormalization: false,
            splitWords: undefined,
            sort: true,
            keepRawCase: false,
            legacy: true,
        });
        const output = await fsp.readFile(destName, 'utf8');
        expect(output.split('\n')).toEqual([
            '',
            '# cspell-tools: keep-case no-split',
            '',
            'hello',
            'rework',
            'tried',
            'try',
            'work',
            'worked',
            '',
        ]);
        expect(consoleOutput()).toMatchSnapshot();
    });
});

describe('Validate Larger Dictionary', () => {
    test('en_US hunspell', async () => {
        const source = await streamWordsFromFile(sampleDictEnUS, {});
        const words = source.take(5000).toArray();
        const trie = normalizeWordsToTrie(words);
        expect(isCircular(trie)).toBe(false);
        const nWords = toArray(legacyNormalizeWords(words)).sort().filter(uniqueFilter(1000));
        const results = iteratorTrieWords(trie).toArray().sort().filter(uniqueFilter(1000));
        expect(results).toEqual(nWords);
    }, 60000);

    test('en_US word list', async () => {
        const source = await streamWordsFromFile(sampleDictEn, {});
        const words = source.toArray();
        const trie = consolidate(normalizeWordsToTrie(words));
        expect(isCircular(trie)).toBe(false);
        const nWords = toArray(legacyNormalizeWords(words)).sort().filter(uniqueFilter(1000));
        const results = iteratorTrieWords(trie).toArray().sort();
        expect(results).toEqual(nWords);
        const data = serializeTrie(trie, { base: 40 });
        const trie2 = importTrie(data);
        const results2 = iteratorTrieWords(trie2).toArray();
        expect(results2).toEqual(results);
    }, 60000);
});

function normalizeWordsToTrie(words: Iterable<string>): Trie.TrieRoot {
    return Trie.buildTrie(legacyNormalizeWords(words)).root;
}

function legacyNormalizeWords(lines: Iterable<string>): Iterable<string> {
    return pipe(
        lines,
        opConcatMap((line) => legacyLineToWords(line))
    );
}

// const cities = `\
// New York
// New Amsterdam
// Los Angeles
// San Francisco
// New Delhi
// Mexico City
// London
// Paris
// `;

const citiesSorted = `\
London
Los Angeles
Mexico City
New Amsterdam
New Delhi
New York
Paris
San Francisco
`;

const citiesResult = `\
new york
new
york
new amsterdam
amsterdam
los angeles
los
angeles
san francisco
san
francisco
new delhi
delhi
mexico city
mexico
city
london
paris
`;

const citiesResultSorted = `\
amsterdam
angeles
city
delhi
francisco
london
los
los angeles
mexico
mexico city
new
new amsterdam
new delhi
new york
paris
san
san francisco
york
`;
